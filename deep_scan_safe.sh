#!/usr/bin/env bash
# Safe mode: không tự exit khi tool lỗi, luôn ghi log
set -u
[[ "${DEBUG:-0}" == "1" ]] && set -x

TS="$(date +%Y%m%d-%H%M%S)"
OUT="_reports/deep/$TS"
LOG="$OUT/run.log"
mkdir -p "$OUT"
exec > >(tee -a "$LOG") 2>&1

info(){ echo "[i] $*"; }
warn(){ echo "[!] $*" >&2; }

# ---- preflight ----
if ! command -v docker >/dev/null 2>&1; then
  warn "Docker chưa cài/không trong PATH → bỏ qua các bước dùng docker."
  USE_DOCKER=0
else
  if ! docker info >/dev/null 2>&1; then
    warn "Docker daemon không chạy hoặc thiếu quyền (docker group)."
    USE_DOCKER=0
  else
    USE_DOCKER=1
  fi
fi

info "Output: $OUT"
info "Docker usable: $USE_DOCKER"

# ---- SEMGREP ----
if [[ "$USE_DOCKER" -eq 1 ]]; then
  info "Semgrep…"
  docker run --rm -v "$PWD:/src" returntocorp/semgrep:latest \
    semgrep --config p/ci --config p/secrets --config p/r2c-security-audit --config p/r2c-best-practices \
    --exclude '**/node_modules/**' --exclude '**/bin/**' --exclude '**/obj/**' --exclude '**/dist/**' \
    --timeout 600 --error --sarif --output /src/"$OUT"/semgrep.sarif /src || warn "Semgrep lỗi (bỏ qua)."
else
  warn "Bỏ qua Semgrep (không dùng được Docker)."
fi

# ---- GITLEAKS ----
if [[ "$USE_DOCKER" -eq 1 ]]; then
  info "Gitleaks…"
  docker run --rm -v "$PWD:/repo" zricethezav/gitleaks:latest \
    detect --no-color --redact --report-format sarif --report-path /repo/"$OUT"/gitleaks.sarif --source /repo \
    || warn "Gitleaks lỗi (bỏ qua)."
else
  warn "Bỏ qua Gitleaks (không dùng được Docker)."
fi

# ---- TRIVY FS ----
if [[ "$USE_DOCKER" -eq 1 ]]; then
  info "Trivy FS…"
  docker run --rm -v "$PWD:/work" aquasec/trivy:latest \
    fs --security-checks vuln,secret,config \
    --scanners vuln,secret,config \
    --skip-dirs '**/node_modules/**,**/bin/**,**/obj/**,**/dist/**' \
    --timeout 10m --format sarif --output /work/"$OUT"/trivy_fs.sarif /work \
    || warn "Trivy FS lỗi (bỏ qua)."
else
  warn "Bỏ qua Trivy FS (không dùng được Docker)."
fi

# ---- HADOLINT (không fail build) ----
if [[ "$USE_DOCKER" -eq 1 ]]; then
  info "Hadolint…"
  { 
    find . -type f -iregex '.*\(Dockerfile\|\.Dockerfile\)$' -print0 \
    | while IFS= read -r -d '' f; do
        docker run --rm -i hadolint/hadolint < "$f" || true
      done
  } > "$OUT/hadolint.txt" || true
else
  warn "Bỏ qua Hadolint (không dùng được Docker)."
fi

# ---- CHECKOV ----
if [[ "$USE_DOCKER" -eq 1 ]]; then
  info "Checkov…"
  docker run --rm -v "$PWD:/src" bridgecrew/checkov:latest \
    -d /src -o sarif --output-file-path /src/"$OUT"/checkov.sarif \
    --framework terraform,kubernetes,github_actions \
    || warn "Checkov lỗi (bỏ qua)."
else
  warn "Bỏ qua Checkov (không dùng được Docker)."
fi

# ---- TRIVY IMAGE (optional) ----
if [[ "$USE_DOCKER" -eq 1 ]]; then
  info "Trivy Image (thử build)…"
  if docker build -t deepscan_tmp:latest . >/dev/null 2>&1; then
    docker run --rm -v "$PWD:/work" aquasec/trivy:latest \
      image --timeout 10m --format sarif --output /work/"$OUT"/trivy_image.sarif deepscan_tmp:latest \
      || warn "Trivy Image lỗi (bỏ qua)."
    docker image rm -f deepscan_tmp:latest >/dev/null 2>&1 || true
  else
    warn "Không build được image → bỏ qua Trivy Image."
  fi
else
  warn "Bỏ qua Trivy Image (không dùng được Docker)."
fi

info "XONG. Kết quả ở: $OUT"
