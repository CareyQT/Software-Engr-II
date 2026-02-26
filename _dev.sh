#!/bin/bash

case "$1" in
  "build")
    echo "Building development environment..."
    docker compose -f docker-compose.dev.yml up -d --build
    ;;
  "run")
    echo "Starting development environment..."
    docker compose -f docker-compose.dev.yml up -d
    ;;
  "down")
    echo "Stopping development environment..."
    docker compose -f docker-compose.dev.yml down
    ;;
  "logs")
    echo "Showing development logs..."
    docker compose -f docker-compose.dev.yml logs -f
    ;;
  "frontend-logs")
    echo "Showing frontend logs..."
    docker logs termwise-development -f
    ;;
  "status")
    echo "Checking development status..."
    docker ps
    ;;
esac 