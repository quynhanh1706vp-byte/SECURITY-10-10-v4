#!/usr/bin/env bash
set -euo pipefail

LOG_PREFIX="[VSP_CI_SUMMARY]"
log() { echo "${LOG_PREFIX} $*"; }

if [[ $# -lt 1 ]]; then
  log "Usage: $0 /path/to/VSP_CI_RUN_DIR"
  exit 1
fi

RUN_DIR="$1"
REPORT_DIR="${RUN_DIR}/report"
SUMMARY_JSON="${REPORT_DIR}/summary_unified.json"
FINDINGS_JSON="${REPORT_DIR}/findings_unified.json"
CI_SUMMARY_TXT="${RUN_DIR}/CI_SUMMARY_HUMAN.txt"

if [[ ! -f "${SUMMARY_JSON}" ]]; then
  log "ERROR: Không tìm thấy ${SUMMARY_JSON}"
  exit 2
fi

log "RUN_DIR    = ${RUN_DIR}"
log "SUMMARY    = ${SUMMARY_JSON}"
log "FINDINGS   = ${FINDINGS_JSON}"

{
  echo "=== VSP SECURITY CI SUMMARY (HUMAN READABLE) ==="
  echo "RUN_DIR   : ${RUN_DIR}"
  echo

  echo "# I. Severity overview"
  jq -r '
    "Run ID    : \(.run_id // \"N/A\")",
    "Source    : \(.source // \"N/A\")",
    "Generated : \(.generated_at // \"N/A\")",
    "",
    "Severity counts:",
    "  CRITICAL = \(.summary_by_severity.CRITICAL // 0)",
    "  HIGH     = \(.summary_by_severity.HIGH // 0)",
    "  MEDIUM   = \(.summary_by_severity.MEDIUM // 0)",
    "  LOW      = \(.summary_by_severity.LOW // 0)",
    "  INFO     = \(.summary_by_severity.INFO // 0)",
    "  TRACE    = \(.summary_by_severity.TRACE // 0)",
    "",
    "Total findings: \(.summary_all.total_findings // .total_findings // 0)"
  ' "${SUMMARY_JSON}" 2>/dev/null || echo "[WARN] Không parse được ${SUMMARY_JSON}"

  echo
  echo "# II. Top tools by findings"
  if command -v jq >/dev/null 2>&1; then
    jq -r '
      .by_tool
      | to_entries
      | sort_by(.value.total) | reverse
      | .[0:5]
      | map("  - \(.key): \(.value.total) findings (CRIT=\(.value.by_severity.CRITICAL // 0), HIGH=\(.value.by_severity.HIGH // 0))")
      | .[]
    ' "${SUMMARY_JSON}" 2>/dev/null || echo "  (no tool stats)"
  else
    echo "  jq not available."
  fi

  echo
  echo "# III. Sample findings (max 10)"
  if [[ -f "${FINDINGS_JSON}" ]]; then
    jq -r '
      .items[0:10] // []
      | to_entries
      | .[]
      | "  - [\(.value.severity // \"?\")] \(.value.tool // \"?\") \(.value.rule_id // \"?\") @ \(.value.file // \"?\"):\(.value.line // 0)"
    ' "${FINDINGS_JSON}" 2>/dev/null || echo "  (no items)"
  else
    echo "  (findings_unified.json not found)"
  fi
} > "${CI_SUMMARY_TXT}" || true

log "Đã ghi ${CI_SUMMARY_TXT}"
