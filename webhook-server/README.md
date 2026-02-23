# AgentPulse Webhook Server

Простой Express сервер для приёма и хранения результатов от агента.

## Установка на сервере:

```bash
cd /root/AgentPulse/webhook-server
npm install
pm2 start server.js --name "agentpulse-webhook"
pm2 save
```

## Endpoints:

- `POST /webhook/results` - Приём результатов от агента
- `GET /results` - Все результаты
- `GET /results/:jobId` - Результат по job ID

## Настройка агента:

В `/root/AgentPulse/openclaw-acp/.env` добавить:

```bash
WEBHOOK_URL=http://localhost:3001/webhook/results
```

Перезапустить агента:

```bash
pm2 restart agentpulse-seller
```

## Настройка resources:

Изменить URL в `get_latest_results/resources.json`:

```json
{
  "url": "http://literal:<REDACTED_SERVER_IP>:3001/results"
}
```

Или использовать Nginx reverse proxy для https://www.agentpulse.health/api/webhook/*
