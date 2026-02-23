# AgentPulse — Статус деплоя ✅

**Дата:** 23 февраля 2026  
**Сервер:** literal:<REDACTED_SERVER_IP>  
**Статус:** 🟢 РАБОТАЕТ

---

## ✅ Что работает

| Компонент | Статус | Детали |
|-----------|--------|--------|
| **PM2 Runtime** | 🟢 Online | `agentpulse-seller` запущен |
| **ACP Socket** | 🟢 Connected | Подключён к `acpx.virtuals.io` |
| **Offerings** | 🟢 Active | `health_check`, `reputation_report` |
| **API Key** | 🟢 Valid | `literal:<REDACTED_API_KEY>` |
| **Задания** | 🟢 Executing | Последнее: reputation_report для x402guard |

---

## 📊 Offerings

### 1. health_check
- **Цена:** 0.5 USDC
- **Описание:** Быстрая проверка здоровья агента
- **Параметры:** `agent_id` (опционально)

### 2. reputation_report
- **Цена:** 1 USDC
- **Описание:** Полный анализ репутации агента
- **Параметры:** `agent_id` (опционально), `period` (7d/30d/90d)

---

## 🔧 Управление

### Проверка статуса
```bash
ssh root@literal:<REDACTED_SERVER_IP>
pm2 status
pm2 logs agentpulse-seller
```

### Перезапуск
```bash
pm2 restart agentpulse-seller
```

### Обновление кода
```bash
cd /root/AgentPulse
git pull
cd openclaw-acp
npm install
pm2 restart agentpulse-seller
```

### Смена API-ключа
```bash
cd /root/AgentPulse/openclaw-acp
echo '{"LITE_AGENT_API_KEY":"НОВЫЙ_КЛЮЧ"}' > config.json
echo 'LITE_AGENT_API_KEY=НОВЫЙ_КЛЮЧ' > .env
pm2 restart agentpulse-seller
```

---

## 📝 Логи

### Последнее успешное задание
- **Job ID:** 1002289150
- **Offering:** reputation_report
- **Client:** 0xF7CA224032210fA6ebd95aeaB509684ac6563818
- **Agent:** x402guard (ID: 1590)
- **Score:** 91/100
- **Status:** ✅ Delivered

---

## 🔗 Ссылки

- **Virtuals App:** https://app.virtuals.io
- **aGDP Metrics:** https://agdp.io
- **GitHub Repo:** https://github.com/AndreyP55/AgentPulse
- **Agent Wallet:** 0xF50dH6A22761B905dd50FC82BBd2a400a62d739C

---

## 🚀 Следующие шаги

1. ✅ Агент работает и принимает задания
2. ✅ Offerings зарегистрированы
3. ✅ PM2 настроен на автозапуск
4. 🔄 Мониторить логи: `pm2 logs agentpulse-seller`
5. 🔄 Продвигать offerings в Butler / соцсетях

---

## ⚠️ Важно

- **Не коммитить** `config.json` и `.env` в Git (содержат API-ключ)
- **Регулярно проверять** логи на ошибки
- **Обновлять** код при изменениях в репозитории
- **Бэкапить** config.json перед изменениями
