#!/bin/bash
# Build frontend
cd difcoll.client
npm install
npm run build

# Copy to backend wwwroot
mkdir -p ../DifColl.Server/wwwroot
cp -r dist/* ../DifColl.Server/wwwroot/

# Publish backend
cd ../DifColl.Server
dotnet publish -c Release -o /app
