# Деплой веб-сайта AgentPulse с webhook

## На сервере:

### 1. Установить зависимости
```bash
cd /root/AgentPulse/website
npm install
```

### 2. Запустить сайт через PM2
```bash
cd /root/AgentPulse/website
pm2 start npm --name "agentpulse-website" -- start
pm2 save
```

### 3. Или для разработки (с hot reload)
```bash
pm2 start npm --name "agentpulse-website-dev" -- run dev
```

### 4. Проверить
```bash
pm2 status
pm2 logs agentpulse-website
```

Сайт будет доступен на: https://www.agentpulse.health

---

## Страницы:

- **Главная:** https://www.agentpulse.health
- **Результаты:** https://www.agentpulse.health/results
- **Webhook API:** https://www.agentpulse.health/api/webhook/results

---

## Как работает:

1. Агент выполняет задание (health_check или reputation_report)
2. Агент отправляет результат на webhook: `POST /api/webhook/results`
3. Webhook сохраняет результат в `data/results/latest.json`
4. Страница `/results` показывает последние 100 результатов
5. Обновляется автоматически каждые 10 секунд

---

## Настройка WEBHOOK_URL в агенте:

В `.env` на сервере добавить (опционально, уже есть по умолчанию):
```bash
WEBHOOK_URL=https://www.agentpulse.health/api/webhook/results
```

Перезапустить агента:
```bash
pm2 restart agentpulse-seller
```
