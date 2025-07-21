#!/usr/bin/env bash

CONFIG_DIR="./kubeconfigs"
OUT="kube_namespaces_only.json"
TMPDIR="/tmp/kubecheck"
MAX_PARALLEL=8

mkdir -p "$TMPDIR"
rm -f "$TMPDIR"/*.json

process_file() {
  local file="$1"
  local winpath
  winpath=$(echo "$file" | sed 's|^\./||; s|/|\\\\|g')
  local namespaces
  namespaces=$(kubectl --kubeconfig="$file" get namespaces --no-headers -o custom-columns=":metadata.name" 2>/dev/null)
  [[ -z "$namespaces" ]] && return

  {
    echo "  {"
    echo "    \"file\": \"${winpath}\","
    echo "    \"namespaces\": ["
    local first=true
    while read -r ns; do
      [[ -z "$ns" ]] && continue
      $first || echo ","
      first=false
      echo "      \"${ns}\""
    done <<< "$namespaces"
    echo "    ]"
    echo "  }"
  } > "$TMPDIR/$(basename "$file").json"
}

# Parallel scan with job control
count=0
for file in "$CONFIG_DIR"/*; do
  [[ -f "$file" ]] || continue
  process_file "$file" &
  ((count++))
  if (( count % MAX_PARALLEL == 0 )); then
    wait
  fi
done
wait

# Merge all JSON parts
{
  echo "["
  first=true
  for part in "$TMPDIR"/*.json; do
    [[ -f "$part" ]] || continue
    $first || echo ","
    first=false
    cat "$part"
  done
  echo "]"
} > "$OUT"

echo "✅ Generato $OUT"
