#!/usr/bin/env bash
cd "$(dirname "$0")"

if ! command -v npm >/dev/null; then
  echo "❌ npm non trovato. Installalo prima di continuare."
  exit 1
fi

npm start
