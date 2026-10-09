#!/usr/bin/env bash
# Regenerates the flow boards and docs/flows/Site Flows.pdf from the live site.
# First run on a new machine: npx playwright install chromium
set -euo pipefail
cd "$(dirname "$0")/../.."
TMP="$(mktemp -d)"
mkdir -p "$TMP/shots" "$TMP/img" docs/flows/boards
node scripts/flows/capture.cjs "$TMP/shots" mobile
node scripts/flows/capture.cjs "$TMP/shots" desktop
node scripts/flows/boards.cjs "$TMP/shots" docs/flows/boards mobile
node scripts/flows/boards.cjs "$TMP/shots" docs/flows/boards desktop
node scripts/flows/pdf.cjs docs/flows/boards "$TMP/img" "docs/flows/Site Flows.pdf"
echo "Wrote docs/flows/Site Flows.pdf and docs/flows/boards/"
