set -o errexit

mix deps.get --only prod
MIX_ENV=prod mix compile
mix phx.digest

# Build the release and overwrite the existing release directory
MIX_ENV=prod mix release --overwrite