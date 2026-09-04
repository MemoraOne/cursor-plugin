#!/usr/bin/env bash
set -euo pipefail

npm_config_audit=false \
MEMORAONE_API_URL="https://memora-api-staging-phbtrzocjq-uk.a.run.app" \
MEMORAONE_OAUTH_ISSUER_URL="https://cvvhdxrswmetkagognec.supabase.co/auth/v1" \
npx -y @memoraone/mcp@staging ensure-gateway
