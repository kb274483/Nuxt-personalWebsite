#!/usr/bin/env bash
set -euo pipefail

# 用途：
# - 在 macOS 使用內建 sips 批次產生縮圖（不依賴 Supabase transform）
# - 建議：縮圖檔案結構要對應到 Supabase Storage 的 `thumb/<原本 file_path>`
#
# 使用方式：
#   ./scripts/make-thumbnails.sh /path/to/originals /path/to/output 600
#
# 說明：
# - 會保留輸入資料夾的相對路徑結構
# - 會把長邊縮到 MAX_SIZE（預設 600），格式維持原副檔名

INPUT_DIR="${1:-}"
OUTPUT_DIR="${2:-}"
MAX_SIZE="${3:-600}"

if [[ -z "${INPUT_DIR}" || -z "${OUTPUT_DIR}" ]]; then
  echo "Usage: $0 <input_dir> <output_dir> [max_size]"
  exit 1
fi

if [[ ! -d "${INPUT_DIR}" ]]; then
  echo "Input dir not found: ${INPUT_DIR}"
  exit 1
fi

mkdir -p "${OUTPUT_DIR}"

shopt -s nullglob

while IFS= read -r -d '' file; do
  rel="${file#${INPUT_DIR}/}"
  out="${OUTPUT_DIR}/${rel}"
  out_dir="$(dirname "${out}")"
  mkdir -p "${out_dir}"

  # -Z: 限制最大邊長
  # -s format: 這裡不強制轉檔，避免品質/相容性意外；你可以自行改成 jpeg/webp
  sips -Z "${MAX_SIZE}" "${file}" --out "${out}" >/dev/null
done < <(find "${INPUT_DIR}" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.heic" -o -iname "*.webp" \) -print0)

echo "Done. Thumbnails generated at: ${OUTPUT_DIR}"
