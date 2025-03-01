#!/bin/bash

# Set error handling
set -e

# Force npm to use legacy-peer-deps and other settings
echo "Setting up npm configuration..."
npm config set legacy-peer-deps true
npm config set strict-peer-dependencies false
npm config set save-exact true
npm config set prefer-offline true
npm config set fund false

# Clean npm cache
echo "Cleaning npm cache..."
npm cache clean --force

# Remove node_modules if it exists
if [ -d "node_modules" ]; then
  echo "Removing existing node_modules..."
  rm -rf node_modules
fi

# Remove package-lock.json if it exists
if [ -f "package-lock.json" ]; then
  echo "Removing existing package-lock.json..."
  rm -f package-lock.json
fi

# Install dependencies with legacy-peer-deps flag
echo "Installing dependencies..."
npm install --legacy-peer-deps --no-fund

# Run the build
echo "Building the application..."
npm run build 