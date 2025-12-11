#!/usr/bin/env bash
set -euo pipefail

# =================[ VSP CI OUTER FULL RUN ]=================
# - KHÔNG sửa gì trong SECURITY_BUNDLE.
# - Tự bật venv của SECURITY_BUNDLE nếu tìm thấy.
# - Nếu phát hiện run_vsp_full_ext.sh:
#     -> Gọi với SRC_ROOT (signature: FULL_CMD SRC_INPUT)
#     -> Parse log để lấy RUN_DIR thật.
# - Nếu là script khác (run_vsp_full_ext_v2.sh / run_all_tools_v2.sh):
#     -> Dùng mode cũ: FULL_CMD OUT_DIR SRC_ROOT.
# ===========================================================

SEC_BUNDLE_ROOT="${SEC_BUNDLE_ROOT:-/home/test/Data/SECURITY_BUNDLE}"
SRC_ROOT="${SRC_ROOT:-$(pwd)}"
RUN_PREFIX="${RUN_PREFIX:-RUN_VSP_FULL_EXT_CI}"

TS="$(date +%Y%m%d_%H%M%S)"
RUN_ID="${RUN_ID:-${RUN_PREFIX}_${TS}}"
RUN_DIR_DEFAULT="${SEC_BUNDLE_ROOT}/out/${RUN_ID}"

GATE_SCRIPT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/vsp_ci_gate_core_v1.sh"

echo "==================[ VSP CI OUTER FULL RUN ]=================="
echo "[OUTER] SEC_BUNDLE_ROOT = ${SEC_BUNDLE_ROOT}"
echo "[OUTER] SRC_ROOT        = ${SRC_ROOT}"
echo "[OUTER] RUN_ID (outer)  = ${RUN_ID}"
echo "[OUTER] RUN_DIR_DEFAULT = ${RUN_DIR_DEFAULT}"
echo "[OUTER] GATE_SCRIPT     = ${GATE_SCRIPT}"
echo "============================================================="

mkdir -p "${RUN_DIR_DEFAULT}/report"

# 0) THỬ BẬT VENV CỦA SECURITY_BUNDLE (NẾU CÓ)
SEC_BUNDLE_VENV="${SEC_BUNDLE_VENV:-${SEC_BUNDLE_ROOT}/.venv/bin/activate}"
if [ -f "$SEC_BUNDLE_VENV" ]; then
  echo "[OUTER] Sourcing venv: $SEC_BUNDLE_VENV"
  # shellcheck disable=SC1090
  source "$SEC_BUNDLE_VENV"
else
  echo "[OUTER][WARN] Không tìm thấy venv tại $SEC_BUNDLE_VENV (bỏ qua bước activate)."
fi

# 1) CHỌN LỆNH FULL SCAN
if [ "${FULL_CMD-}" != "" ]; then
  CANDIDATES=("$FULL_CMD")
else
  CANDIDATES=(
    "${SEC_BUNDLE_ROOT}/bin/run_vsp_full_ext_v2.sh"
    "${SEC_BUNDLE_ROOT}/bin/run_vsp_full_ext.sh"
    "${SEC_BUNDLE_ROOT}/bin/run_all_tools_v2.sh"
  )
fi

FOUND_CMD=""
for c in "${CANDIDATES[@]}"; do
  if [ -x "$c" ]; then
    FOUND_CMD="$c"
    break
  fi
done

if [ -z "$FOUND_CMD" ]; then
  echo "[OUTER][ERR] Không tìm thấy lệnh full scan phù hợp."
  echo "[OUTER][ERR] Đã thử các candidate:"
  for c in "${CANDIDATES[@]}"; do
    echo "  - $c"
  done
  echo "[OUTER][HINT] Anh có thể:"
  echo "  1) Kiểm tra xem lệnh full scan anh đang dùng tên gì (trong bin/)."
  echo "  2) Export FULL_CMD trỏ tới lệnh đó, ví dụ:"
  echo "     FULL_CMD=\"/home/test/Data/SECURITY_BUNDLE/bin/run_vsp_full_ext.sh\" \\"
  echo "       ./vsp_ci_outer_full_v1.sh"
  exit 2
fi

echo "[OUTER] Dùng FULL_CMD = ${FOUND_CMD}"

# 2) GỌI FULL SCAN THEO ĐÚNG CHỮ KÝ
LOG_FILE="$(mktemp /tmp/vsp_full_XXXX.log)"

if [[ "${FOUND_CMD}" == *"run_vsp_full_ext.sh" ]]; then
  echo "[OUTER] Detected run_vsp_full_ext.sh – dùng signature: FULL_CMD SRC_ROOT"
  echo "[OUTER] Gọi: ${FOUND_CMD} \"${SRC_ROOT}\""
  "${FOUND_CMD}" "${SRC_ROOT}" 2>&1 | tee "${LOG_FILE}"
else
  echo "[OUTER] Dùng signature FULL_CMD OUT_DIR SRC_ROOT"
  echo "[OUTER] Gọi: ${FOUND_CMD} \"${RUN_DIR_DEFAULT}\" \"${SRC_ROOT}\""
  "${FOUND_CMD}" "${RUN_DIR_DEFAULT}" "${SRC_ROOT}" 2>&1 | tee "${LOG_FILE}"
fi

# 3) PARSE RUN_DIR THẬT TỪ LOG (ưu tiên dòng 'RUN_DIR   = ...')
RUN_DIR_DETECTED="$(grep -E 'RUN_DIR\s*=' "${LOG_FILE}" | tail -1 | sed -E 's/.*RUN_DIR\s*=\s*//')"

if [ -z "${RUN_DIR_DETECTED}" ]; then
  echo "[OUTER][WARN] Không parse được RUN_DIR từ log, fallback RUN_DIR_DEFAULT."
  RUN_DIR="${RUN_DIR_DEFAULT}"
else
  RUN_DIR="${RUN_DIR_DETECTED}"
fi

echo "[OUTER] RUN_DIR dùng cho CI GATE = ${RUN_DIR}"

# 4) GỌI CI GATE
echo "[OUTER] Gọi CI GATE: ${GATE_SCRIPT}"
VSP_CI_MAX_CRIT="${VSP_CI_MAX_CRIT:-0}" \
VSP_CI_MAX_HIGH="${VSP_CI_MAX_HIGH:-0}" \
"${GATE_SCRIPT}" "${RUN_DIR}"

EXIT_CODE=$?
echo "[OUTER] CI GATE EXIT_CODE = ${EXIT_CODE}"
exit "${EXIT_CODE}"
