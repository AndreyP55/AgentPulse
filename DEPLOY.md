# AgentPulse — деплой с нуля

Пошаговая инструкция для развёртывания агента на сервере.

> **Перед деплоем:** закоммить и запушить изменения в репозиторий, чтобы скрипт подтянул актуальный код.

---

## Требования

- **Сервер:** Ubuntu 22.04/24.04, root доступ
- **Node.js:** 20.x или выше (`node -v`)
- **PM2:** `npm install -g pm2`
- **API-ключ:** получить на https://app.virtuals.io (агент должен называться **AgentPulse**)

---

## Быстрый деплой (один скрипт)

В SSH-сессии на сервере:

```bash
# 1. Скачать скрипт и запустить
cd /root
curl -sL https://raw.githubusercontent.com/AndreyP55/AgentPulse/main/openclaw-acp/deploy-from-scratch.sh -o deploy.sh
chmod +x deploy.sh
LITE_AGENT_API_KEY=ВАШ_API_КЛЮЧ ./deploy.sh
```

**Или** если репозиторий уже склонирован:

```bash
cd /root/AgentPulse/openclaw-acp
chmod +x deploy-from-scratch.sh
./deploy-from-scratch.sh
```

---

## Ручной деплой по шагам

### 1. Подготовка сервера

```bash
ssh root@literal:<REDACTED_SERVER_IP>

# Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
node -v   # должно быть v20.x.x

# PM2
npm install -g pm2
```

### 2. Очистка и клонирование

```bash
pm2 delete agentpulse-seller 2>/dev/null || true
rm -rf /root/AgentPulse
cd /root
git clone https://github.com/AndreyP55/AgentPulse.git
cd AgentPulse/openclaw-acp
npm install
```

### 3. API-ключ

```bash
# config.json
echo '{"LITE_AGENT_API_KEY":"ВАШ_API_КЛЮЧ"}' > config.json

# .env (дублирование)
echo 'LITE_AGENT_API_KEY=ВАШ_API_КЛЮЧ' > .env
```

### 4. Регистрация offerings

```bash
npx tsx bin/acp.ts sell create health_check
npx tsx bin/acp.ts sell create reputation_report
npx tsx bin/acp.ts sell list   # проверка
```

### 5. Запуск PM2

```bash
pm2 start "npx tsx src/seller/runtime/seller.ts" --name agentpulse-seller
pm2 save
pm2 startup   # автозапуск при перезагрузке
```

### 6. Проверка

```bash
pm2 status
pm2 logs agentpulse-seller --lines 30
```

Ожидаемый вывод в логах:
```
[seller] Agent: AgentPulse (dir: agentpulse)
[seller] Available offerings: health_check, reputation_report
[seller] Seller runtime is running. Waiting for jobs...
[socket] Connected to ACP
```

---

## Частые проблемы

| Проблема | Решение |
|----------|---------|
| `LITE_AGENT_API_KEY is not set` | Добавить ключ в `config.json` или `.env` |
| `Failed to resolve agent info` | Проверить API-ключ на https://app.virtuals.io |
| `offering.json not found` | Имя агента на Virtuals должно быть **AgentPulse** (папка `agentpulse`) |
| `Node.js` ошибки | Установить Node 20+: `nvm install 20` или nodesource |
| PM2 процесс падает | `pm2 logs agentpulse-seller` — смотреть причину |

---

## Полезные ссылки

- **Virtuals / Butler:** https://app.virtuals.io
- **aGDP (метрики):** https://agdp.io
- **ACP API:** https://acpx.virtuals.io
