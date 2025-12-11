#!/usr/bin/env bash
set -euo pipefail

# ===================[ VSP CI GATE – CORE ]===================
# KHÔNG sửa gì trong SECURITY_BUNDLE.
# Chỉ đọc summary_unified.json và tính CRIT/HIGH với fallback:
#   1) .summary_all.by_severity
#   2) .by_severity
#
# Env:
#   VSP_CI_MAX_CRIT   - Ngưỡng CRITICAL cho phép (default: 0)
#   VSP_CI_MAX_HIGH   - Ngưỡng HIGH cho phép (default: 0)
#
# Usage:
#   VSP_CI_MAX_CRIT=0 VSP_CI_MAX_HIGH=0 \\
#     ./vsp_ci_gate_core_v1.sh /path/to/RUN_VSP_FULL_EXT_...
# ============================================================

if [ $# -lt 1 ]; then
  echo "Usage: $0 /path/to/RUN_DIR"
  exit 1
fi

RUN_DIR="$1"
SUMMARY="$RUN_DIR/report/summary_unified.json"

if [ ! -f "$SUMMARY" ]; then
  echo "[VSP_CI_CORE][ERR] Không tìm thấy $SUMMARY"
  echo "  PATH: $SUMMARY"
  exit 2
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "[VSP_CI_CORE][ERR] Thiếu lệnh jq (cần để đọc JSON)."
  exit 3
fi

MAX_CRIT="${VSP_CI_MAX_CRIT:-0}"
MAX_HIGH="${VSP_CI_MAX_HIGH:-0}"

# Đọc CRIT/HIGH với 2 cấp ưu tiên: summary_all.by_severity -> by_severity
CRIT=$(jq '(
  .summary_all.by_severity.CRITICAL
  // .by_severity.CRITICAL
  // 0
)' "$SUMMARY")

HIGH=$(jq '(
  .summary_all.by_severity.HIGH
  // .by_severity.HIGH
  // 0
)' "$SUMMARY")

echo "=== VSP CI GATE (CORE / EXTERNAL) ==="
echo "RUN_DIR   = $RUN_DIR"
echo "SUMMARY   = $SUMMARY"
echo "CRITICAL  = $CRIT"
echo "HIGH      = $HIGH"
echo "MAX_CRIT  = $MAX_CRIT"
echo "MAX_HIGH  = $MAX_HIGH"

STATUS="PASS"
EXIT_CODE=0

if [ "$CRIT" -gt "$MAX_CRIT" ] || [ "$HIGH" -gt "$MAX_HIGH" ]; then
  STATUS="FAIL"
  EXIT_CODE=1
fi

echo "GATE_STATUS = $STATUS"
exit "$EXIT_CODE"
