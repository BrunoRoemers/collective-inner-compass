#!/usr/bin/env bash

INVARIANT_USE_ENV="[use env]"

DBS=(
  "$INVARIANT_USE_ENV"
  "development-bruno"
  "staging"
  "production"
)

# prompt user to select database
_SELECTED_DB="$(printf '%s\n' "${DBS[@]}" | fzf)"

if [ "$_SELECTED_DB" != "$INVARIANT_USE_ENV" ]; then  
  # prompt for password
  read -s -r -p "Password for $_SELECTED_DB: " _PASSWORD
  echo ""

  # override environment
  # TODO decouple database name and user name
  export DATABASE_URL="postgresql://$_SELECTED_DB:$_PASSWORD@collective-inner-compass-7196.8nj.cockroachlabs.cloud:26257/$_SELECTED_DB?sslmode=verify-full"
fi

echo "opening studio for $_SELECTED_DB..."

exec npx prisma studio