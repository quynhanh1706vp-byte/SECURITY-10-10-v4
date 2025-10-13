#!/usr/bin/env bash
set -euo pipefail

# --- Prep
mkdir -p _reports/sarif _reports/export
echo "[i] Ensuring jq present..."
if ! command -v jq >/dev/null 2>&1; then
  sudo apt-get update && sudo apt-get install -y jq
fi

# --- Install/ensure Semgrep
if ! command -v semgrep >/dev/null 2>&1; then
  echo "[i] Installing semgrep (pip)"
  pip3 install --user semgrep || curl -sL https://semgrep.dev/install.sh | bash
  export PATH="$HOME/.local/bin:$PATH"
fi

# --- Install/ensure Trivy
if ! command -v trivy >/dev/null 2>&1; then
  echo "[i] Installing trivy"
  sudo apt-get update && sudo apt-get install -y wget apt-transport-https gnupg
  wget -qO- https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
  echo deb https://aquasecurity.github.io/trivy-repo/deb stable main | sudo tee /etc/apt/sources.list.d/trivy.list
  sudo apt-get update && sudo apt-get install -y trivy
fi

# --- Ensure Gitleaks (dùng binary bạn đã upload nếu có)
if ! command -v gitleaks >/dev/null 2>&1; then
  if [ -x /mnt/data/gitleaks_extracted/gitleaks ]; then
    sudo cp /mnt/data/gitleaks_extracted/gitleaks /usr/local/bin/gitleaks
    sudo chmod +x /usr/local/bin/gitleaks
  else
    echo "[i] Installing gitleaks"
    GL_URL=$(curl -s https://api.github.com/repos/gitleaks/gitleaks/releases/latest | jq -r '.assets[]|select(.name|test("linux_x64|linux-amd64"))|.browser_download_url' | head -n 1)
    curl -L "$GL_URL" -o gitleaks.tgz
    tar -xzf gitleaks.tgz
    chmod +x gitleaks* || true
    sudo mv gitleaks* /usr/local/bin/gitleaks
  fi
fi

# --- SEMGREP: quét sâu, ưu tiên ERROR (map ~ High)
echo "[i] Running Semgrep (ERROR-only)…"
semgrep \
  --config p/default \
  --config p/ci \
  --config p/secrets \
  --config p/security-audit \
  --config p/r2c-best-practices \
  --error --timeout 900 \
  --sarif --output _reports/sarif/semgrep.sarif \
  --severity ERROR \
  || true

# --- TRIVY FS: vuln+secret+config, chỉ lấy HIGH/CRITICAL
echo "[i] Running Trivy FS (HIGH,CRITICAL)…"
trivy fs . \
  --scanners vuln,secret,config \
  --severity HIGH,CRITICAL \
  --format sarif \
  --output _reports/sarif/trivy_fs.sarif \
  --timeout 10m \
  || true

# --- Gitleaks: secrets (non-blocking)
echo "[i] Running Gitleaks…"
gitleaks detect --redact \
  --report-format sarif \
  --report-path _reports/sarif/gitleaks.sarif \
  --exit-code 0 \
  || true

# --- Extractor (jq tương thích bản cũ)
EXTRACT=extract_all_high.sh
cat > "$EXTRACT" <<'EX'
#!/usr/bin/env bash
set -euo pipefail
IN_DIR="${1:-_reports/sarif}"
OUT="${2:-_reports/export/ALL_high_critical.csv}"
mkdir -p "$(dirname "$OUT")"
echo "tool,severity,rule_id,rule_name,file,line,message,reference" > "$OUT"
shopt -s globstar nullglob
for f in "$IN_DIR"/**/*.sarif; do
  [[ -s "$f" ]] || continue
  TOOL="$(basename "$f" .sarif)"
  jq -r --arg TOOL "$TOOL" '
    def numsafe: try tonumber catch (try (tostring|tonumber) catch 0);
    def tosev($r):
      ($r.level // "warning") as $lvl
      | (($r.properties // {})["security-severity"] | numsafe) as $n
      | if   $lvl=="error"   then "HIGH"
        elif $lvl=="warning" then "MEDIUM"
        elif $lvl=="note"    then "LOW"
        else (if   $n >= 8 then "CRITICAL"
              elif $n >= 7 then "HIGH"
              elif $n >= 4 then "MEDIUM"
              elif $n >= 0 then "LOW"
              else "INFO" end)
        end;

    .runs[]? as $run
    | ($run.tool.driver.rules // []) as $rules
    | def rname($id):
        ( $rules[]? | select(.id==$id) | .shortDescription.text ) //
        ( $rules[]? | select(.id==$id) | .name ) //
        $id // "n/a";
    | def rref($id):
        ( $rules[]? | select(.id==$id) | .helpUri ) // "";

    ($run.results // [])
    | map({
        rid:   (.ruleId // "n/a"),
        rname: (rname(.ruleId)),
        ref:   (rref(.ruleId)),
        msg:   (.message.text // "n/a"),
        file:  (.locations[0].physicalLocation.artifactLocation.uri // "n/a"),
        line:  (.locations[0].physicalLocation.region.startLine // 0),
        level: (.level // "warning"),
        props: (.properties // {})
      })
    | map(. + { severity: ( tosev(.) ) })
    | map(select(.severity=="CRITICAL" or .severity=="HIGH" or .severity=="ERROR"))
    | .[]
    | [$TOOL, .severity, .rid, .rname, .file, (.line|tostring), .msg, .ref]
    | @csv
  ' "$f" >> "$OUT" || true
done
echo "[i] Wrote $OUT"
EX
chmod +x "$EXTRACT"

# --- Run extract (strict)
./extract_all_high.sh _reports/sarif _reports/export/ALL_high_critical.csv || true

LINES=$(wc -l < _reports/export/ALL_high_critical.csv || echo 0)
echo "[i] STRICT lines: $LINES"

# --- Nếu vẫn chỉ có header → xuất thêm bản extended (kèm MEDIUM)
if [ "$LINES" -le 1 ]; then
  echo "[!] No HIGH/CRITICAL — exporting extended with MEDIUM"
  sed -i 's/CRITICAL" or .severity=="HIGH" or .severity=="ERROR"/CRITICAL" or .severity=="HIGH" or .severity=="ERROR" or .severity=="MEDIUM"/' extract_all_high.sh
  ./extract_all_high.sh _reports/sarif _reports/export/ALL_high_critical_or_medium.csv || true
fi

# --- Summary
echo "== Outputs =="
ls -lh _reports/export || true
echo "Preview STRICT:"
head -n 20 _reports/export/ALL_high_critical.csv || true
echo "Preview EXT (if any):"
head -n 20 _reports/export/ALL_high_critical_or_medium.csv || true
