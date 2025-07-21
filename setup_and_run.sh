#!/usr/bin/env bash

# Verifica Node.js e npm
if ! command -v node >/dev/null || ! command -v npm >/dev/null; then
  echo "⚠️ Node.js e npm sono richiesti. Installali prima di procedere."
  exit 1
fi

# Avvia l'interfaccia di installazione (che gestirà tutto)
echo "🚀 Avvio interfaccia di installazione..."
npx electron install.js

