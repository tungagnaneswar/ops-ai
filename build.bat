@echo off
echo ==============================================================================
echo Building all 8 OpsAI Backend Microservices with Maven Wrapper...
echo ==============================================================================
cd backend
call .\api-gateway\mvnw.cmd clean package -DskipTests
cd ..
echo ==============================================================================
echo Build Complete! You can now run: docker compose --profile backend up -d
echo ==============================================================================
