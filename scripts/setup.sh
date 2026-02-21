#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# setup.sh — One-command local development setup
# Usage: chmod +x scripts/setup.sh && ./scripts/setup.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'

echo -e "${BLUE}"
echo "  ██╗     ██╗   ██╗██╗  ██╗███████╗"
echo "  ██║     ██║   ██║╚██╗██╔╝██╔════╝"
echo "  ██║     ██║   ██║ ╚███╔╝ █████╗  "
echo "  ██║     ██║   ██║ ██╔██╗ ██╔══╝  "
echo "  ███████╗╚██████╔╝██╔╝ ██╗███████╗"
echo "  ╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝"
echo -e "${NC}"
echo -e "${GREEN}Full Stack Dev Setup — Spring Boot + ReactJS${NC}"
echo ""

# ── Check Prerequisites ──────────────────────────────────────────────────────
echo -e "${YELLOW}Checking prerequisites...${NC}"

check_tool() {
  if ! command -v $1 &> /dev/null; then
    echo -e "${RED}❌ $1 is not installed. Please install it first.${NC}"
    exit 1
  fi
  echo -e "${GREEN}✅ $1 found${NC}"
}

check_tool java
check_tool mvn
check_tool node
check_tool npm
check_tool docker
check_tool docker-compose || check_tool "docker compose"

# Check Java version
JAVA_VER=$(java -version 2>&1 | head -1 | cut -d'"' -f2 | cut -d'.' -f1)
if [ "$JAVA_VER" -lt "17" ] 2>/dev/null; then
  echo -e "${RED}❌ Java 17+ required. Found Java $JAVA_VER${NC}"
  exit 1
fi

echo ""
echo -e "${YELLOW}Starting MySQL via Docker...${NC}"
cd docker
docker-compose up -d mysql
echo -e "${GREEN}✅ MySQL starting...${NC}"

# Wait for MySQL
echo "Waiting for MySQL to be ready..."
for i in {1..30}; do
  if docker-compose exec -T mysql mysqladmin ping -h localhost -u root -prootpassword --silent 2>/dev/null; then
    echo -e "${GREEN}✅ MySQL is ready!${NC}"
    break
  fi
  if [ $i -eq 30 ]; then echo -e "${RED}❌ MySQL failed to start${NC}"; exit 1; fi
  sleep 2
done
cd ..

# ── Backend Setup ────────────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}Setting up backend...${NC}"
cd backend
mvn dependency:resolve -q
echo -e "${GREEN}✅ Backend dependencies downloaded${NC}"
cd ..

# ── Frontend Setup ───────────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}Setting up frontend...${NC}"
cd frontend
npm ci
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
cd ..

# ── Create .env files ────────────────────────────────────────────────────────
if [ ! -f "backend/src/main/resources/application-local.properties" ]; then
  cat > backend/src/main/resources/application-local.properties << 'EOF'
spring.datasource.url=jdbc:mysql://localhost:3306/luxe_ecommerce?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=luxe_user
spring.datasource.password=luxe_password
app.jwt.secret=LocalDevSecret_AtLeast256BitsLong_CHANGE_IN_PRODUCTION_PLEASE!!
app.cors.allowed-origins=http://localhost:5173,http://localhost:3000
EOF
  echo -e "${GREEN}✅ Created backend/src/main/resources/application-local.properties${NC}"
fi

if [ ! -f "frontend/.env.local" ]; then
  cat > frontend/.env.local << 'EOF'
VITE_API_BASE_URL=http://localhost:8080/api
VITE_ENV=development
EOF
  echo -e "${GREEN}✅ Created frontend/.env.local${NC}"
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  🎉 Setup Complete! Start the app:         ║${NC}"
echo -e "${GREEN}╠════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  Backend:                                  ║${NC}"
echo -e "${GREEN}║  cd backend && mvn spring-boot:run         ║${NC}"
echo -e "${GREEN}║                                            ║${NC}"
echo -e "${GREEN}║  Frontend (new terminal):                  ║${NC}"
echo -e "${GREEN}║  cd frontend && npm run dev                ║${NC}"
echo -e "${GREEN}║                                            ║${NC}"
echo -e "${GREEN}║  URLs:                                     ║${NC}"
echo -e "${GREEN}║  Frontend:  http://localhost:5173          ║${NC}"
echo -e "${GREEN}║  Backend:   http://localhost:8080/api      ║${NC}"
echo -e "${GREEN}║  Swagger:   http://localhost:8080/api/     ║${NC}"
echo -e "${GREEN}║             swagger-ui.html                ║${NC}"
echo -e "${GREEN}║  DB Admin:  http://localhost:8081          ║${NC}"
echo -e "${GREEN}║             (run with --profile tools)     ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
