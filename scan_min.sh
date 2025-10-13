#!/usr/bin/env bash
# Scan an toàn: KHÔNG exit khi lỗi, log từng bước
set -uo pipefail
export PATH="$HOME/.local/bin:$PATH"

LOG="_reports/run.log"
OUT_SARIF="_reports/sarif"
OUT_EXPORT="_reports/export"
mkdir -p "$OUT_SARIF" "$OUT_EXPORT" "$(dirname "$LOG")"

ts(){ date +"%Y-%m-%d %H:%M:%S"; }
run(){
  echo "[$(ts)] >>> $*" | tee -a "$LOG"
  eval "$@" >>"$LOG" 2>&1
  ec=$?
  echo "[$(ts)] <<< exit=$ec" | tee -a "$LOG"
  return 0  # luôn tiếp tục
}

echo "======== SCAN START $(ts) ========" | tee -a "$LOG"

# --- Kiểm tra tool sẵn có (không cài đặt để tránh đòi sudo)
for t in semgrep trivy gitleaks jq; do
  if command -v "$t" >/dev/null 2>&1; then
    echo "[$(ts)] Found $t: $(command -v $t)" | tee -a "$LOG"
  else
    echo "[$(ts)] WARN: missing $t (bỏ qua bước dùng $t)" | tee -a "$LOG"
  fi
done

# --- SEMGREP (nếu có)
if command -v semgrep >/dev/null 2>&1; then
  run "semgrep \
    --config p/default \
    --config p/owasp-top-ten \
    --config p/ci \
    --config p/security-audit \
    --config p/secrets \
    --config p/r2c-best-practices \
    --timeout 900 \
    --sarif --output $OUT_SARIF/semgrep.sarif \
    --severity WARNING"
fi

# --- TRIVY (nếu có) — nếu mạng kém: thêm --skip-db-update
if command -v trivy >/dev/null 2>&1; then
  run "trivy fs . \
    --scanners vuln,secret,config \
    --severity MEDIUM,HIGH,CRITICAL \
    --format sarif \
    --output $OUT_SARIF/trivy_fs.sarif \
    --timeout 15m \
    --ignore-unfixed=false \
    --skip-dirs '**/node_modules/**,**/bin/**,**/obj/**,**/.git/**,**/dist/**'"
fi

# --- GITLEAKS (nếu có)
# ưu tiên binary bạn đã giải nén
if ! command -v gitleaks >/dev/null 2>&1 && [ -x /mnt/data/gitleaks_extracted/gitleaks ]; then
  export PATH="/mnt/data/gitleaks_extracted:$PATH"
fi
if command -v gitleaks >/dev/null 2>&1; then
  run "gitleaks detect --redact \
    --report-format sarif \
    --report-path $OUT_SARIF/gitleaks.sarif \
    --exit-code 0"
fi

# --- GỘP CSV STRICT (HIGH/CRITICAL/ERROR)
if command -v jq >/dev/null 2>&1; then
  cat > _reports/extract_strict.sh <<'EX'
#!/usr/bin/env bash
set -uo pipefail
IN_DIR="${1:-_reports/sarif}"
OUT="${2:-_reports/export/ALL_high_critical.csv}"
mkdir -p "$(dirname "$OUT")"
echo "tool,severity,rule_id,rule_name,file,line,message,reference" > "$OUT"
shopt -s globstar nullglob
for f in "$IN_DIR"/**/*.sarif; do
  [[ -s "$f" ]] || continue
  TOOL="$(basename "$f" .sarif)"
  jq -r --arg TOOL "$TOOL" '
    def n: try tonumber catch (try (tostring|tonumber) catch 0);
    def sev($r):
      ($r.level // "warning") as $lvl
      | (($r.properties // {})["security-severity"] | n) as $s
      | if   $lvl=="error"   then "HIGH"
        elif $lvl=="warning" then "MEDIUM"
        elif $lvl=="note"    then "LOW"
        else (if   $s >= 8 then "CRITICAL"
              elif $s >= 7 then "HIGH"
              elif $s >= 4 then "MEDIUM"
              elif $s >= 0 then "LOW"
              else "INFO" end)
        end;
    .runs[]? as $run
    | ($run.tool.driver.rules // []) as $rules
    | def rname($id):
        ( $rules[]? | select(.id==$id) | .shortDescription.text ) //
        ( $rules[]? | select(.id==$id) | .name ) // $id;
    | def rref($id):
        ( $rules[]? | select(.id==$id) | .helpUri ) // "";
    ($run.results // [])
    | map({
        rid:   (.ruleId // "n/a"),
        rname: (rname(.ruleId // "n/a")),
        ref:   (rref(.ruleId // "n/a")),
        msg:   (.message.text // "n/a"),
        file:  (.locations[0].physicalLocation.artifactLocation.uri // "n/a"),
        line:  (.locations[0].physicalLocation.region.startLine // 0),
        level: (.level // "warning"),
        props: (.properties // {})
      })
    | map(. + { severity: ( sev(.) ) })
    | map(select(.severity=="CRITICAL" or .severity=="HIGH" or .severity=="ERROR"))
    | .[]
    | [$TOOL, .severity, .rid, .rname, .file, (.line|tostring), .msg, .ref]
    | @csv
  ' "$f" >> "$OUT" || true
done
echo "[i] Wrote $OUT" >&2
EX
  chmod +x _reports/extract_strict.sh
  run "_reports/extract_strict.sh _reports/sarif _reports/export/ALL_high_critical.csv"
else
  echo "[WARN] jq not found -> bỏ qua bước gộp CSV" | tee -a "$LOG"
fi

# --- Nếu STRICT rỗng -> gộp EXTENDED (thêm MEDIUM)
if command -v jq >/dev/null 2>&1; then
  LINES=$(wc -l < "$OUT_EXPORT/ALL_high_critical.csv" 2>/dev/null || echo 0)
  if [ "$LINES" -le 1 ]; then
    cat > _reports/extract_ext.sh <<'EX'
#!/usr/bin/env bash
set -uo pipefail
IN_DIR="${1:-_reports/sarif}"
OUT="${2:-_reports/export/ALL_high_critical_or_medium.csv}"
mkdir -p "$(dirname "$OUT")"
echo "tool,severity,rule_id,rule_name,file,line,message,reference" > "$OUT"
shopt -s globstar nullglob
for f in "$IN_DIR"/**/*.sarif; do
  [[ -s "$f" ]] || continue
  TOOL="$(basename "$f" .sarif)"
  jq -r --arg TOOL "$TOOL" '
    def n: try tonumber catch (try (tostring|tonumber) catch 0);
    def sev($r):
      ($r.level // "warning") as $lvl
      | (($r.properties // {})["security-severity"] | n) as $s
      | if   $lvl=="error"   then "HIGH"
        elif $lvl=="warning" then "MEDIUM"
        elif $lvl=="note"    then "LOW"
        else (if   $s >= 8 then "CRITICAL"
              elif $s >= 7 then "HIGH"
              elif $s >= 4 then "MEDIUM"
              elif $s >= 0 then "LOW"
              else "INFO" end)
        end;
    .runs[]? as $run
    | ($run.tool.driver.rules // []) as $rules
    | def rname($id):
        ( $rules[]? | select(.id==$id) | .shortDescription.text ) //
        ( $rules[]? | select(.id==$id) | .name ) // $id;
    | def rref($id):
        ( $rules[]? | select(.id==$id) | .helpUri ) // "";
    ($run.results // [])
    | map({
        rid:   (.ruleId // "n/a"),
        rname: (rname(.ruleId // "n/a")),
        ref:   (rref(.ruleId // "n/a")),
        msg:   (.message.text // "n/a"),
        file:  (.locations[0].physicalLocation.artifactLocation.uri // "n/a"),
        line:  (.locations[0].physicalLocation.region.startLine // 0),
        level: (.level // "warning"),
        props: (.properties // {})
      })
    | map(. + { severity: ( sev(.) ) })
    | map(select(.severity=="CRITICAL" or .severity=="HIGH" or .severity=="ERROR" or .severity=="MEDIUM"))
    | .[]
    | [$TOOL, .severity, .rid, .rname, .file, (.line|tostring), .msg, .ref]
    | @csv
  ' "$f" >> "$OUT" || true
done
echo "[i] Wrote $OUT" >&2
EX
    chmod +x _reports/extract_ext.sh
    run "_reports/extract_ext.sh _reports/sarif _reports/export/ALL_high_critical_or_medium.csv"
  fi
fi

echo "======== SCAN END $(ts) ========" | tee -a "$LOG"
echo "[i] Artifacts:"
ls -lh "$OUT_SARIF" "$OUT_EXPORT" 2>/dev/null | sed 's/^/[i] /'
