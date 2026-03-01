# AgentPulse

AI-агент для мониторинга здоровья и репутации других агентов в экосистеме [Virtuals Protocol](https://virtuals.io).

## Что это

**AgentPulse** анализирует AI-агентов через [aGDP.io](https://agdp.io) API и предоставляет услуги через Agent Commerce Protocol (ACP). Другие агенты могут нанимать AgentPulse для проверки своих коллег.

### Услуги (Offerings)

| Offering | Цена | Описание |
|----------|------|----------|
| `health_check` | 0.25 USDC | Быстрая проверка статуса агента: online/offline, score, активность |
| `reputation_report` | 0.50 USDC | Полный отчёт: метрики, сильные/слабые стороны, рекомендации |
| `agent_risk_flags` | 0.10 USDC | Флаги рисков, оценка рисков, вердикт |
| `multi_agent_report` | 100 USDC | Полный анализ до 10 агентов: здоровье + риски + рейтинг + сводка |
| `competitor_analysis` | 200 USDC | Конкурентный анализ: позиция на рынке, сравнение, рекомендации |

## Технологии

- **Runtime:** Node.js 20+, TypeScript
- **Blockchain:** Virtuals Protocol (Base L2)
- **Framework:** OpenClaw ACP
- **Frontend:** Next.js 15, React 19, Tailwind CSS
- **Backend:** Express 4.18 (webhook server)
- **Process Manager:** PM2

## Структура

```
AgentPulse/
├── openclaw-acp/          # Агент (seller runtime, offerings, CLI)
│   ├── src/
│   │   ├── commands/      # CLI-команды (browse, sell, serve, deploy...)
│   │   ├── seller/
│   │   │   ├── runtime/   # Seller runtime (ACP socket, job execution)
│   │   │   ├── offerings/ # Offerings (health_check, reputation_report, agent_risk_flags, multi_agent_report, competitor_analysis)
│   │   │   └── resources/ # External resources (webhook endpoints)
│   │   └── lib/           # Утилиты (config, output, open)
│   └── package.json
├── website/               # Next.js frontend (результаты, дашборд)
│   ├── src/app/           # App Router pages & API routes
│   └── package.json
└── webhook-server/        # Express сервер для приёма результатов
    ├── server.js
    └── package.json
```

## Быстрый старт

```bash
# 1. Установка
cd openclaw-acp
npm install

# 2. Настройка
cp .env.example .env
# Заполнить API ключ в .env

# 3. Запуск
npx tsx src/seller/runtime/seller.ts
```

## Деплой (VPS)

```bash
ssh root@<YOUR_SERVER_IP>
cd /root/AgentPulse/openclaw-acp
git pull && npm install
pm2 start "npx tsx src/seller/runtime/seller.ts" --name agentpulse-seller
pm2 save && pm2 startup
```

## Переменные окружения

| Переменная | Где | Описание |
|------------|-----|----------|
| `ACP_API_KEY` | openclaw-acp/.env | API ключ Virtuals Protocol |
| `WEBHOOK_URL` | openclaw-acp/.env | URL для отправки результатов |
| `WEBHOOK_SECRET` | openclaw-acp/.env, website/.env.local | Секрет для аутентификации webhook |

## Лицензия

Private project
