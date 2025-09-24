#!/bin/bash

# E2E Test Script for Depositor API
# This script sets up the environment and runs end-to-end tests

set -e  # Exit on any error

echo "🚀 Starting E2E Test Suite for Depositor API"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    print_status "Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            print_success "$service_name is ready!"
            return 0
        fi
        
        print_status "Attempt $attempt/$max_attempts - $service_name not ready yet..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "$service_name failed to start within expected time"
    return 1
}

# Function to cleanup on exit
cleanup() {
    print_status "Cleaning up..."
    
    # Stop the main application if it's running
    if [ ! -z "$APP_PID" ]; then
        print_status "Stopping main application (PID: $APP_PID)..."
        kill $APP_PID 2>/dev/null || true
        wait $APP_PID 2>/dev/null || true
    fi
    
    # Stop webhook server if it's running
    if [ ! -z "$WEBHOOK_PID" ]; then
        print_status "Stopping webhook server (PID: $WEBHOOK_PID)..."
        kill $WEBHOOK_PID 2>/dev/null || true
        wait $WEBHOOK_PID 2>/dev/null || true
    fi
    
    # Stop docker services
    print_status "Stopping Docker services..."
    docker-compose down 2>/dev/null || true
}

# Set up trap to cleanup on exit
trap cleanup EXIT

# Check prerequisites
print_status "Checking prerequisites..."

if ! command_exists docker; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command_exists docker-compose; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command_exists npm; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_success "All prerequisites are available"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "docker-compose.yml" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed"
else
    print_status "Dependencies already installed"
fi

# Start PostgreSQL
print_status "Starting PostgreSQL database..."
docker-compose up postgres -d

# Set environment variables
export DB_CONNECTION_URL="postgres://postgres:postgres@localhost:5432/postgres?sslmode=disable"


# Start the main application
print_status "Starting main application..."
npm start &
APP_PID=$!

# Wait for main application to be ready
wait_for_service "http://localhost:3000/health" "Main Application" || {
    print_error "Main application failed to start"
    exit 1
}

# Start the webhook server
# print_status "Starting webhook server..."
# node e2e_test/e2e-webhook-server.js &
# WEBHOOK_PID=$!

# Wait for webhook server to be ready
# wait_for_service "http://localhost:3001/health" "Webhook Server" || {
#     print_error "Webhook server failed to start"
#     exit 1
# }

# Run the e2e tests
print_status "Running E2E tests..."
echo ""

# Set environment variables for the test
export API_BASE_URL="http://localhost:3000"
export WEBHOOK_URL="http://localhost:3001/webhook"

# Run the test
node e2e_test/e2e-test.js

# Capture the exit code
TEST_EXIT_CODE=$?

if [ $TEST_EXIT_CODE -eq 0 ]; then
    print_success "All E2E tests passed! 🎉"
else
    print_error "Some E2E tests failed! 💥"
fi

# The cleanup function will be called automatically due to the trap
exit $TEST_EXIT_CODE
