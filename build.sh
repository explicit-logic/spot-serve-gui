#!/bin/bash

# Load environment variables
if [ -f .env ]; then
  set -a && source .env && set +a
else
  echo "Error: .env file not found"
  exit 1
fi

bunx tauri build --verbose
