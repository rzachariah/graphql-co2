set -e

echo "Short sleep to allow service to come up..."
sleep 5

# Run test
yarn test-api