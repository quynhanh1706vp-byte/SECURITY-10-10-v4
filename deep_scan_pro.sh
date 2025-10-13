#!/usr/bin/env bash
# Quét sâu: Semgrep + Gitleaks + Trivy FS + Checkov + (Hadolint)
# Safe-mode: không exit khi tool lỗi, luôn có log
set -u
[[ "${DEBUG:-0}" == "1" ]] && set -x

TS="$(date +%Y%m%d-%H%M%S)"
OUT="_reports/deep/$TS"
LOG="$OUT/run.log"
mkdir -p "$OUT"
exec > >(tee -a "$LOG") 2>&1

info(){ echo "[i] $*"; }
warn(){ echo "[!] $*" >&2; }

# -- Preflight
if ! command -v jq >/dev/null 2>&1; then
  warn "Thiếu jq (sudo apt-get update && sudo apt-get install -y jq). Vẫn chạy, nhưng extract có thể lỗi."
fi
if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  USE_DOCKER=1
else
  USE_DOCKER=0
  warn "Docker không sẵn sàng → bỏ qua các bước Docker."
fi
info "Output: $OUT"
info "Docker usable: $USE_DOCKER"

# --- SEMGREP ---
if [[ $USE_DOCKER -eq 1 ]]; then
  info "Semgrep (wide packs)…"
  docker run --rm -v "$PWD:/src" returntocorp/semgrep:latest semgrep \
    --config p/ci --config p/secrets --config p/r2c-security-audit --config p/r2c-best-practices \
    --exclude '**/node_modules/**' --exclude '**/bin/**' --exclude '**/obj/**' --exclude '**/dist/**' \
    --timeout 600 --error --sarif --output /src/"$OUT"/semgrep.sarif /src || warn "Semgrep lỗi (bỏ qua)."
else
  warn "Bỏ qua Semgrep (Docker không sẵn)."
fi

# --- GITLEAKS ---
if [[ $USE_DOCKER -eq 1 ]]; then
  info "Gitleaks (secrets + history)…"
  docker run --rm -v "$PWD:/repo" zricethezav/gitleaks:latest detect \
    --no-color --redact --no-git --no-repo-config \
    --report-format sarif --report-path /repo/"$OUT"/gitleaks.sarif --source /repo || warn "Gitleaks lỗi (bỏ qua)."
else
  warn "Bỏ qua Gitleaks."
fi

# --- TRIVY FS ---
if [[ $USE_DOCKER -eq 1 ]]; then
  info "Trivy FS (vuln+secret+config)…"
  docker run --rm -v "$PWD:/work" aquasec/trivy:latest fs \
    --security-checks vuln,secret,config --scanners vuln,secret,config \
    --skip-dirs '**/node_modules/**,**/bin/**,**/obj/**,**/dist/**' \
    --timeout 10m --format sarif --output /work/"$OUT"/trivy_fs.sarif /work || warn "Trivy FS lỗi (bỏ qua)."
else
  warn "Bỏ qua Trivy FS."
fi

# --- CHECKOV (IaC) ---
if [[ $USE_DOCKER -eq 1 ]]; then
  info "Checkov (IaC)…"
  docker run --rm -v "$PWD:/src" bridgecrew/checkov:latest \
    -d /src -o sarif --output-file-path /src/"$OUT"/checkov.sarif \
    --framework terraform,kubernetes,github_actions || warn "Checkov lỗi (bỏ qua)."
else
  warn "Bỏ qua Checkov."
fi

# --- HADOLINT (Dockerfile) ---
if [[ $USE_DOCKER -eq 1 ]]; then
  info "Hadolint…"
  { find . -type f -iregex '.*\(Dockerfile\|\.Dockerfile\)$' -print0 \
    | while IFS= read -r -d '' f; do docker run --rm -i hadolint/hadolint < "$f" || true; done; } \
    > "$OUT/hadolint.txt" || true
else
  warn "Bỏ qua Hadolint."
fi

# --- Báo cáo nhanh số kết quả từ từng SARIF ---
if command -v jq >/dev/null 2>&1; then
  for s in "$OUT"/*.sarif; do
    [[ -s "$s" ]] || continue
    c="$(jq '[.runs[]?.results[]?] | length' "$s" 2>/dev/null || echo 0)"
    echo "[i] $(basename "$s") → results: $c"
  done
fi

info "XONG. SARIF/LOG nằm trong: $OUT"
