#!/usr/bin/env bash
# Trích tất cả SARIF trong thư mục run mới nhất → CSV, chỉ ERROR/CRITICAL/HIGH
set -euo pipefail
shopt -s globstar nullglob

BASE="${1:-_reports/deep}"
LAST_DIR="$(ls -1dt "$BASE"/* | head -1 || true)"
[[ -d "$LAST_DIR" ]] || { echo "[!] Không tìm thấy thư mục run trong $BASE"; exit 0; }

OUT_DIR="_reports/export"
mkdir -p "$OUT_DIR"
CSV="$OUT_DIR/ALL_high_critical.csv"
echo "tool,severity,rule_id,rule_name,file,line,message,reference" > "$CSV"

for f in "$LAST_DIR"/**/*.sarif; do
  [[ -s "$f" ]] || continue
  TOOL="$(basename "$f" .sarif)"
  jq -r --arg TOOL "$TOOL" '
    def num(x): (x|tonumber? // (x|tostring|tonumber? // -1));
    def tosev:
      .properties["security-severity"] as $sec?
      | if .level=="error" then "HIGH"
        elif .level=="warning" then "MEDIUM"
        elif .level=="note" then "LOW"
        else (
          (num($sec)) as $n
          | if $n >= 8 then "CRITICAL"
            elif $n >= 7 then "HIGH"
            elif $n >= 4 then "MEDIUM"
            elif $n >= 0 then "LOW"
            else "INFO" end
        )
        end;

    .runs[]? as $run
    | ($run.tool.driver.rules // []) as $rules
    | def rname($id): ($rules[]? | select(.id==$id) | .shortDescription.text // .name // .id // "n/a");
    | def rref($id): ($rules[]? | select(.id==$id) | .helpUri) // "";

    ($run.results // [])
    | map({
        rid: (.ruleId // "n/a"),
        rname: (rname(.ruleId)),
        ref: (rref(.ruleId)),
        msg: (.message.text // "n/a"),
        file: (.locations[0].physicalLocation.artifactLocation.uri // "n/a"),
        line: (.locations[0].physicalLocation.region.startLine // 0),
        level: (.level // "warning"),
        props: (.properties // {})
      })
    | map(. + { severity: ( . + {level:.level, properties:.props} | tosev ) })
    | map(select(.severity=="HIGH" or .severity=="CRITICAL" or .severity=="ERROR"))
    | .[] | [$TOOL, .severity, .rid, .rname, .file, (.line|tostring), .msg, .ref]
    | @csv
  ' "$f" >> "$CSV" || true
done

echo "[i] Wrote $CSV"

# Thống kê nhanh
if command -v awk >/dev/null 2>&1; then
  echo "[i] Summary by severity:"
  awk -F',' 'NR>1{c[$2]++} END{for(k in c) print k,c[k]}' "$CSV" | sort
fi
