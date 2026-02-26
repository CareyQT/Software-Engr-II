#!/bin/bash

case "$1" in
  "build")
    echo "Building production environment..."
    docker compose -f docker-compose.prod.yml up -d --build
    ;;
  "run")
    echo "Starting production environment..."
    docker compose -f docker-compose.prod.yml up -d
    ;;
  "down")
    echo "Stopping production environment..."
    docker compose -f docker-compose.prod.yml down
    ;;
  "logs")
    echo "Showing production logs..."
    docker compose -f docker-compose.prod.yml logs -f
    ;;
  "status")
    echo "Checking production status..."
    docker ps
    ;;
esac
