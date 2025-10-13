#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
OUT_SARIF="_reports/sarif"
OUT_EXPORT="_reports/export"
mkdir -p "$OUT_SARIF" "$OUT_EXPORT"

log(){ printf "[%s] %s\n" "$(date +'%H:%M:%S')" "$*"; }

need(){ command -v "$1" >/dev/null 2>&1 || return 1; }

install_jq(){ sudo apt-get update -y && sudo apt-get install -y jq >/dev/null; }
install_curl(){ sudo apt-get update -y && sudo apt-get install -y curl >/dev/null; }
install_pip(){ sudo apt-get update -y && sudo apt-get install -y python3-pip >/dev/null; }
install_wget(){ sudo apt-get update -y && sudo apt-get install -y wget >/dev/null; }

# --- Prereqs
need jq    || install_jq
need curl  || install_curl
need pip3  || install_pip
need wget  || install_wget

export PATH="$HOME/.local/bin:$PATH"

# --- Semgrep: tăng độ nhạy (WARN/ERROR), nhiều pack hơn
if ! need semgrep; then
  log "Installing semgrep"
  pip3 install --user semgrep >/dev/null
fi
log "Semgrep: scanning (WARN+ERROR, nhiều pack)…"
semgrep \
  --config p/default \
  --config p/owasp-top-ten \
  --config p/ci \
  --config p/security-audit \
  --config p/secrets \
  --config p/r2c-best-practices \
  --timeout 1200 \
  --sarif --output "${OUT_SARIF}/semgrep.sarif" \
  --severity WARNING || true

# --- Trivy: quét sâu hơn, bao gồm MEDIUM (cho đủ dữ liệu), bật tất cả scanners
if ! need trivy; then
  log "Installing Trivy"
  sudo apt-get update -y && sudo apt-get install -y apt-transport-https gnupg >/dev/null
  wget -qO- https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add - >/dev/null 2>&1 || true
  echo deb https://aquasecurity.github.io/trivy-repo/deb stable main | sudo tee /etc/apt/sources.list.d/trivy.list >/dev/null
  sudo apt-get update -y >/dev/null && sudo apt-get install -y trivy >/dev/null
fi
log "Trivy: fs vuln+secret+config, severity MEDIUM,HIGH,CRITICAL"
trivy fs . \
  --scanners vuln,secret,config \
  --severity MEDIUM,HIGH,CRITICAL \
  --format sarif \
  --output "${OUT_SARIF}/trivy_fs.sarif" \
  --timeout 20m \
  --ignore-unfixed=false \
  --skip-dirs '**/node_modules/**,**/bin/**,**/obj/**,**/.git/**,**/dist/**' || true

# --- OSV-Scanner (sâu về dependency các ngôn ngữ)
if ! need osv-scanner; then
  log "Installing osv-scanner"
  curl -sSfL https://raw.githubusercontent.com/google/osv-scanner/main/install.sh | sh -s -- -b .
  sudo mv ./osv-scanner /usr/local/bin/osv-scanner
fi
log "OSV-Scanner: scan manifests (recursive)"
osv-scanner -r . --format sarif > "${OUT_SARIF}/osv.sarif" || true

# --- Bandit (Python security) nếu có Python code
if ! need bandit; then pip3 install --user bandit >/dev/null || true; fi
if need bandit; then
  if find . -type f -name '*.py' -print -quit | grep -q .; then
    log "Bandit: scan Python"
    bandit -r . -f sarif -o "${OUT_SARIF}/bandit.sarif" || true
  fi
fi

# --- npm audit (nếu có package.json)
if need npm && [ -f package.json ]; then
  log "npm audit: creating SARIF"
  # npm audit JSON -> SARIF (đơn giản hoá): dùng jq convert nếu có output JSON
  npm audit --json > "${OUT_SARIF}/npm_audit.json" || true
  # Convert sơ lược JSON -> SARIF cực gọn (có thể không đầy đủ schema)
  jq -r '
    . as $root |
    {
      "version":"2.1.0",
      "runs":[
        {
          "tool":{"driver":{"name":"npm-audit","rules":[]}},
          "results":(
            ($root.vulnerabilities // {}) as $v
            | [ $v[]? | {
                "ruleId": (.name // "npm-advisory"),
                "level": (if (.severity=="critical" or .severity=="high") then "error" else "warning" end),
                "message":{"text": (.title // .name // "vuln")},
                "properties":{"security-severity":
                  (if .severity=="critical" then 9
                   elif .severity=="high" then 8
                   elif .severity=="moderate" then 5
                   else 2 end)
                }
              }]
          )
        }
      ]
    }
  ' "${OUT_SARIF}/npm_audit.json" > "${OUT_SARIF}/npm_audit.sarif" || true
fi

# --- gitleaks (secrets)
if ! need gitleaks; then
  if [ -x /mnt/data/gitleaks_extracted/gitleaks ]; then
    sudo cp /mnt/data/gitleaks_extracted/gitleaks /usr/local/bin/gitleaks && sudo chmod +x /usr/local/bin/gitleaks
  else
    tmpdir="$(mktemp -d)"
    curl -s https://api.github.com/repos/gitleaks/gitleaks/releases/latest \
      | jq -r '.assets[]|select(.name|test("linux_x64|linux-amd64")).browser_download_url' \
      | head -n1 | xargs -I{} curl -L "{}" -o "$tmpdir/gitleaks.tgz"
    tar -xzf "$tmpdir/gitleaks.tgz" -C "$tmpdir"
    chmod +x "$tmpdir"/gitleaks* || true
    sudo mv "$tmpdir"/gitleaks* /usr/local/bin/gitleaks
  fi
fi
log "Gitleaks: scan repo+history (redact)"
gitleaks detect --redact --report-format sarif --report-path "${OUT_SARIF}/gitleaks.sarif" --exit-code 0 || true

# --- Checkov (IaC) – Terraform/K8s/CloudFormation, v.v.
if ! need checkov; then pip3 install --user checkov >/dev/null || true; fi
if need checkov; then
  if find . -type f \( -name '*.tf' -o -name 'k8s*.yaml' -o -name '*.yml' -o -name '*.yaml' \) -print -quit | grep -q .; then
    log "Checkov: IaC (SARIF)"
    checkov -d . -o sarif > "${OUT_SARIF}/checkov.sarif" || true
  fi
fi

# --- Hadolint (Dockerfile)
if ! need hadolint; then
  curl -sSL -o hadolint https://github.com/hadolint/hadolint/releases/latest/download/hadolint-Linux-x86_64 && chmod +x hadolint && sudo mv hadolint /usr/local/bin/
fi
if find . -type f -name 'Dockerfile*' -print -quit | grep -q .; then
  log "Hadolint: lint Dockerfile(s)"
  # xuất SARIF từng file
  find . -type f -name 'Dockerfile*' -print0 | while IFS= read -r -d '' f; do
    hadolint -f sarif "$f" > "${OUT_SARIF}/hadolint_$(echo "$f" | tr '/:' '__').sarif" || true
  done
fi

log "=== Done scanning. SARIF files:"
find "$OUT_SARIF" -type f -name '*.sarif' -printf '%p\n' | sed 's/^/[sarif] /' || true

# --- Gộp CSV STRICT (HIGH/CRITICAL/ERROR)
cat > extract_strict.sh <<'EX'
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
chmod +x extract_strict.sh
./extract_strict.sh "$OUT_SARIF" "$OUT_EXPORT/ALL_high_critical.csv" || true

# --- Nếu strict trống → gộp MEDIUM (extended) để có dữ liệu review
LINES=$(wc -l < "$OUT_EXPORT/ALL_high_critical.csv" || echo 0)
if [ "$LINES" -le 1 ]; then
  cat > extract_extended.sh <<'EX'
#!/usr/bin/env bash
set -euo pipefail
IN_DIR="${1:-_reports/sarif}"
OUT="${2:-_reports/export/ALL_high_critical_or_medium.csv}"
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
    | map(select(.severity=="CRITICAL" or .severity=="HIGH" or .severity=="ERROR" or .severity=="MEDIUM"))
    | .[]
    | [$TOOL, .severity, .rid, .rname, .file, (.line|tostring), .msg, .ref]
    | @csv
  ' "$f" >> "$OUT" || true
done
echo "[i] Wrote $OUT"
EX
  chmod +x extract_extended.sh
  ./extract_extended.sh "$OUT_SARIF" "$OUT_EXPORT/ALL_high_critical_or_medium.csv" || true
fi

log "== DONE. Exports =="
ls -lh "$OUT_EXPORT" || true
