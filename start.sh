#!/bin/bash

echo "🚀 Emirates SDET Case Study - Starting Services"
echo "================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "❌ Java is not installed. Please install Java 17+ first."
    exit 1
fi

# Check if Maven is installed
if ! command -v mvn &> /dev/null; then
    echo "❌ Maven is not installed. Please install Maven first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Function to start backend
start_backend() {
    echo "📦 Starting Backend (Node.js)..."
    cd backend
    if [ ! -d "node_modules" ]; then
        echo "📥 Installing backend dependencies..."
        npm install
    fi
    npm start &
    BACKEND_PID=$!
    cd ..
    echo "✅ Backend started with PID: $BACKEND_PID"
}

# Function to start API Gateway
start_api_gateway() {
    echo "🌐 Starting API Gateway (Spring Boot)..."
    cd api-gateway
    if [ ! -d "target" ]; then
        echo "📥 Building API Gateway..."
        mvn clean compile
    fi
    mvn spring-boot:run &
    GATEWAY_PID=$!
    cd ..
    echo "✅ API Gateway started with PID: $GATEWAY_PID"
}

# Function to start frontend
start_frontend() {
    echo "🎨 Starting Frontend..."
    cd frontend
    if command -v python3 &> /dev/null; then
        python3 -m http.server 8000 &
    elif command -v python &> /dev/null; then
        python -m http.server 8000 &
    elif command -v npx &> /dev/null; then
        npx serve . -p 8000 &
    else
        echo "⚠️  No HTTP server found. Please install Python or serve package."
        echo "   You can manually start frontend by running: cd frontend && python -m http.server 8000"
        return
    fi
    FRONTEND_PID=$!
    cd ..
    echo "✅ Frontend started with PID: $FRONTEND_PID"
}

# Function to wait for services
wait_for_services() {
    echo "⏳ Waiting for services to be ready..."
    
    # Wait for backend
    echo "   Waiting for Backend..."
    for i in {1..30}; do
        if curl -s http://localhost:3000/health > /dev/null; then
            echo "   ✅ Backend is ready"
            break
        fi
        if [ $i -eq 30 ]; then
            echo "   ❌ Backend failed to start"
            return 1
        fi
        sleep 1
    done
    
    # Wait for API Gateway
    echo "   Waiting for API Gateway..."
    for i in {1..30}; do
        if curl -s http://localhost:8080/actuator/health > /dev/null; then
            echo "   ✅ API Gateway is ready"
            break
        fi
        if [ $i -eq 30 ]; then
            echo "   ❌ API Gateway failed to start"
            return 1
        fi
        sleep 1
    done
}

# Function to show service URLs
show_urls() {
    echo ""
    echo "🎉 All services are running!"
    echo "============================"
    echo "📱 Frontend:     http://localhost:8000"
    echo "🔧 Backend:      http://localhost:3000"
    echo "🌐 API Gateway:  http://localhost:8080"
    echo ""
    echo "📚 API Documentation:"
    echo "   Backend API:      http://localhost:3000/api/apps"
    echo "   Gateway API:      http://localhost:8080/api/apps"
    echo "   Health Check:     http://localhost:3000/health"
    echo "   Gateway Health:   http://localhost:8080/health"
    echo "   GW Swagger UI:    http://localhost:8080/webjars/swagger-ui/index.html#/"
    echo "   BE Swagger UI:    http://localhost:3000/api-docs"
    echo ""
    echo "🧪 Testing:"
    echo "   Backend Tests:    cd backend && npm test"
    echo "   Contract Tests:   cd api-gateway && mvn test"
    echo ""
    echo "Press Ctrl+C to stop all services"
}

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "✅ Backend stopped"
    fi
    if [ ! -z "$GATEWAY_PID" ]; then
        kill $GATEWAY_PID 2>/dev/null
        echo "✅ API Gateway stopped"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "✅ Frontend stopped"
    fi
    echo "👋 All services stopped"
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

# Start services
start_backend
sleep 2
start_api_gateway
sleep 2
start_frontend

# Wait for services to be ready
if wait_for_services; then
    show_urls
    
    # Keep script running
    while true; do
        sleep 1
    done
else
    echo "❌ Failed to start services"
    cleanup
fi 