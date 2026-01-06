#!/bin/bash

COMPOSE_FILE="docker-compose.yml"

echo "Starting EcoOffice System Deployment..."

if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install Docker first."
    exit 1
fi

if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
else
    echo "Error: Docker Compose is not installed."
    exit 1
fi

echo "Docker is installed. Using compose command: '$DOCKER_COMPOSE_CMD'"

HISTORY_FILE="./sensor_history.json"

if [ -d "$HISTORY_FILE" ]; then
    echo "Found directory instead of file at $HISTORY_FILE. Removing..."
    rm -rf "$HISTORY_FILE"
fi

if [ ! -f "$HISTORY_FILE" ]; then
    echo "Creating empty $HISTORY_FILE to prevent Docker errors..."
    echo "{}" > "$HISTORY_FILE"
else
    echo "$HISTORY_FILE exists."
fi

mkdir -p mosquitto/config mosquitto/data mosquitto/log

if [ -f "$COMPOSE_FILE" ]; then
   

    echo "Stopping old containers..."
    $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" down

    echo "Starting new containers..."
    $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" up -d

    echo "System started successfully!"
    echo "Showing logs (Press Ctrl+C to exit logs, containers will keep running)..."
    sleep 2
    $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" logs -f
else
    echo "Error: $COMPOSE_FILE not found!"
    exit 1
fi
