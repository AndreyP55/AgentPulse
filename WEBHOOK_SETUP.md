# 🔥 WEBHOOK SETUP - QUICK GUIDE

## ЧТО СДЕЛАНО:

✅ **На сайте:**
- API endpoint `/api/webhook/results` для приема данных от агента
- API `/api/cases` теперь читает из локального файла `data/results.json`
- Case Studies и Recent Checks показывают реальные данные

✅ **В агенте:**
- Добавлен модуль `shared/webhook.ts` для отправки результатов
- `health_check` отправляет данные после каждой проверки
- Работает в фоне, не блокирует выполнение джобы

---

## 🚀 КАК ЗАПУСТИТЬ:

### 1. **ЛОКАЛЬНО (для тестирования):**

```bash
# В терминале 1 - запусти сайт:
cd website
npm run dev
# Сайт будет на http://localhost:3000

# В терминале 2 - запусти агента:
cd openclaw-acp
npx tsx src/seller/runtime/seller.ts
```

Агент будет отправлять результаты на `http://localhost:3000/api/webhook/results`

---

### 2. **НА СЕРВЕРЕ:**

#### A) Задеплой сайт на Vercel:
```bash
cd website
vercel deploy --prod
# Получишь URL типа: https://agent-pulse.vercel.app
```

#### B) Настрой переменную окружения на сервере:
```bash
ssh root@<YOUR_SERVER_IP>
cd /root/AgentPulse/openclaw-acp

# Создай .env файл:
nano .env

# Добавь строку:
WEBHOOK_URL=https://agent-pulse.vercel.app/api/webhook/results

# Сохрани (Ctrl+O, Enter, Ctrl+X)

# Перезапусти агента:
pm2 restart agentpulse-seller
pm2 logs agentpulse-seller
```

---

### 3. **ТЕСТИРОВАНИЕ:**

#### A) Создай тестовую джобу:
- Открой https://app.virtuals.io/acp/butler
- Закажи health_check для любого агента (например, agent 84)
- Подожди выполнения

#### B) Проверь что данные пришли:
```bash
# На сайте:
curl http://localhost:3000/api/webhook/results

# Или открой в браузере:
http://localhost:3000/api/cases
```

#### C) Проверь на сайте:
- http://localhost:3000 - Recent Health Checks
- http://localhost:3000/cases - Case Studies

Должны показаться реальные данные агента!

---

## 📁 СТРУКТУРА ДАННЫХ:

Файл `website/data/results.json` содержит:
```json
[
  {
    "jobId": "1002081883",
    "timestamp": "2026-02-19T...",
    "agentId": "84",
    "agentName": "Ethy AI",
    "service": "Health Check",
    "price": 0.25,
    "score": 90,
    "status": "healthy",
    "metrics": {
      "successRate": 99.64,
      "jobsCompleted": 1125408,
      "revenue": 511283.85,
      "rank": 1
    },
    "recommendations": [...]
  }
]
```

---

## 🔧 TROUBLESHOOTING:

### Webhook не работает:
```bash
# Проверь что сайт запущен:
curl http://localhost:3000/api/webhook/results

# Проверь логи агента:
pm2 logs agentpulse-seller --lines 50
```

### Данные не показываются:
```bash
# Проверь файл:
cat website/data/results.json

# Или через API:
curl http://localhost:3000/api/cases
```

---

## ⚡ БЫСТРЫЙ СТАРТ (5 МИНУТ):

1. Останови агента локально (если запущен)
2. Запусти сайт: `cd website && npm run dev`
3. Запусти агента: `cd openclaw-acp && npx tsx src/seller/runtime/seller.ts`
4. Создай тестовую джобу в Butler
5. Обнови http://localhost:3000/cases
6. **Готово!** ✅

---

Если что-то не работает - пиши!
