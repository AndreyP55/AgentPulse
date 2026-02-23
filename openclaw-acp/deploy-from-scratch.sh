#!/bin/bash
# =============================================================================
# AgentPulse — деплой с нуля на сервер
# Запускать на сервере: bash deploy-from-scratch.sh
# =============================================================================
set -e

API_KEY="${LITE_AGENT_API_KEY:-literal:<REDACTED_API_KEY>}"
REPO_URL="https://github.com/AndreyP55/AgentPulse.git"
INSTALL_DIR="/root/AgentPulse"
OPENCLAW_DIR="$INSTALL_DIR/openclaw-acp"

echo "=============================================="
echo "  AgentPulse — деплой с нуля"
echo "=============================================="

# --- Этап 1: Остановить и удалить старые процессы ---
echo ""
echo "[1/7] Останавливаю старые процессы PM2..."
pm2 delete agentpulse-seller 2>/dev/null || true
pm2 save 2>/dev/null || true

# --- Этап 2: Удалить старую установку ---
echo ""
echo "[2/7] Удаляю старую установку..."
rm -rf "$INSTALL_DIR"

# --- Этап 3: Клонировать репозиторий ---
echo ""
echo "[3/7] Клонирую репозиторий..."
cd /root
git clone "$REPO_URL" "$INSTALL_DIR"
cd "$OPENCLAW_DIR"

# --- Этап 4: Установить зависимости ---
echo ""
echo "[4/7] Устанавливаю зависимости..."
npm install

# --- Этап 5: Настроить API-ключ ---
echo ""
echo "[5/7] Настраиваю API-ключ..."
# Создаём config.json с API ключом
cat > config.json << EOF
{
  "LITE_AGENT_API_KEY": "$API_KEY"
}
EOF

# Дублируем в .env (dotenv подхватывает при старте)
echo "LITE_AGENT_API_KEY=$API_KEY" > .env
[ -f .env.example ] && grep -E '^[A-Z_]+=' .env.example | grep -v '^LITE_AGENT_API_KEY=' >> .env 2>/dev/null || true

echo "  API-ключ записан в config.json и .env"

# --- Этап 6: Создать offerings ---
echo ""
echo "[6/7] Регистрирую offerings на ACP..."
npx tsx bin/acp.ts sell create health_check
npx tsx bin/acp.ts sell create reputation_report

echo ""
echo "  Проверка зарегистрированных offerings:"
npx tsx bin/acp.ts sell list

# --- Этап 7: Запустить через PM2 ---
echo ""
echo "[7/7] Запускаю агент через PM2..."
pm2 delete agentpulse-seller 2>/dev/null || true
cd "$OPENCLAW_DIR"
pm2 start "npx tsx src/seller/runtime/seller.ts" --name agentpulse-seller
pm2 save

echo ""
echo "=============================================="
echo "  Деплой завершён!"
echo "=============================================="
echo ""
echo "Проверка:"
echo "  pm2 status"
echo "  pm2 logs agentpulse-seller"
echo ""
echo "Если агент не подключается — проверь:"
echo "  1. Имя агента на Virtuals должно быть 'AgentPulse'"
echo "  2. API-ключ актуален: https://app.virtuals.io"
echo "  3. Node.js >= 20: node -v"
echo ""
