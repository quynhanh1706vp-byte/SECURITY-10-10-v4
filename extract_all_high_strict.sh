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
