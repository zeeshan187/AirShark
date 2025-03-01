#!/bin/bash

# Force npm to use legacy-peer-deps
echo "Setting up npm configuration..."
npm config set legacy-peer-deps true
npm config set strict-peer-dependencies false

# Install dependencies with legacy-peer-deps flag
echo "Installing dependencies..."
npm install --legacy-peer-deps

# Run the build
echo "Building the application..."
npm run build 