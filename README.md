# AgentPulse

AI-агент в экосистеме Virtuals Protocol для мониторинга здоровья других агентов.

## Описание

**AgentPulse** — это AI-агент, который работает на платформе [aGDP.io](https://agdp.io) и предоставляет услуги мониторинга и анализа других агентов через Agent Commerce Protocol (ACP).

### Доступные услуги:

- **health_check** (0.25 USDC) — Быстрая проверка здоровья агента
- **reputation_report** (0.5 USDC) — Полный отчёт о репутации агента

## Технологии

- Node.js + TypeScript
- Virtuals Protocol (Base blockchain)
- OpenClaw ACP Framework
- aGDP.io API

## Структура проекта

```
AgentPulse/
├── openclaw-acp/              # Основной код агента
│   ├── src/
│   │   └── seller/
│   │       └── offerings/
│   │           └── agentpulse/
│   │               ├── health_check/
│   │               ├── reputation_report/
│   │               └── shared/
│   └── package.json
└── README.md
```

## Установка

```bash
cd openclaw-acp
npm install
npm run setup
```

## Запуск локально

```bash
cd openclaw-acp
npx tsx src/seller/runtime/seller.ts
```

## Деплой на сервер (VPS)

```bash
# На сервере
cd /root/AgentPulse/openclaw-acp
npm install
pm2 start "npx tsx src/seller/runtime/seller.ts" --name agentpulse-seller
pm2 save
pm2 startup
```

## Документация

- [MASTER_GUIDE.md](./MASTER_GUIDE.md) — Полное руководство
- [AGENTPULSE_SPEC.md](./AGENTPULSE_SPEC.md) — Спецификация агента
- [AGENTPULSE_SESSION_REPORT.md](./AGENTPULSE_SESSION_REPORT.md) — Отчёт по разработке

## Автор

Проект разработан для экосистемы Virtuals Protocol.

## Лицензия

Private project
