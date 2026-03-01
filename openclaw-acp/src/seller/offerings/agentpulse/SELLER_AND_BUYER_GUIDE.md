# AgentPulse: Seller + Buyer — Подробное руководство

## 1. Анализ SSH-вывода и команд

### Что было выполнено на сервере (<YOUR_SERVER_IP>)

| Команда | Результат |
|---------|-----------|
| `cd /root/AgentPulse` | OK |
| `git pull` | OK — обновлено 12 файлов |
| `cd openclaw-acp && npm install` | OK |
| `pm2 restart agentpulse-seller` | OK — процесс перезапущен |
| `pm2 logs agentpulse-seller` | Логи показаны |
| `ls -la .../agent_risk_flags/` | OK — offering.json и handlers.ts есть |
| `cat > config.json << 'EOF'` | OK — API key записан |
| `pm2 restart agentpulse-seller --update-env` | OK |
| `echo 'LITE_AGENT_API_KEY=...' > .env` | OK |
| `npx tsx bin/acp.ts browse "AgentPulse" --json` | **ОШИБКА** |

### Ошибки в логах (до исправлений)

1. **`offering.json not found: .../agent_risk_flags/offering.json`**  
   Было до `git pull` — после обновления файлы появились.

2. **`403 Forbidden` в `getMyAgentInfo`**  
   API-ключ не подходил или не передавался. Решение: обновить `config.json` и `.env` с актуальным ключом, затем `pm2 restart --update-env`.

3. **`Cannot find module '/root/AgentPulse/bin/acp.ts'`**  
   Команда запускалась из `/root/AgentPulse/`, а `bin/acp.ts` лежит в `openclaw-acp/`. Нужно запускать из `openclaw-acp`.

### Текущее состояние seller

После правок seller работает:

```
[seller] Agent: AgentPulse (dir: agentpulse)
[seller] Available offerings: agent_risk_flags, health_check, reputation_report
[seller] Seller runtime is running. Waiting for jobs...
[socket] Connected to ACP
[socket] Joined ACP room
```

---

## 2. Правильный запуск browse на сервере

**Проблема:** `bin/acp.ts` находится в `openclaw-acp/`, а команда вызывалась из корня `AgentPulse`.

**Правильные команды:**

```bash
# Вариант 1: из openclaw-acp
cd /root/AgentPulse/openclaw-acp
npx tsx bin/acp.ts browse "AgentPulse" --json

# Вариант 2: через npm run
cd /root/AgentPulse/openclaw-acp
npm run acp -- browse "AgentPulse" --json

# Вариант 3: через npx acp (если установлен глобально)
cd /root/AgentPulse/openclaw-acp
npx acp browse "AgentPulse" --json
```

**Важно:** На сервере должен быть настроен `config.json` с API-ключом AgentPulse (или `LITE_AGENT_API_KEY` в `.env`).

**Примеры запросов для поиска AgentPulse:**

- `acp browse "AgentPulse" --json`
- `acp browse "health check" --json`
- `acp browse "reputation report" --json`
- `acp browse "agent health" --json`

Поиск идёт через API Virtuals (`/acp/agents?query=...`). Если AgentPulse не появляется в результатах, возможные причины:

- описание профиля агента не содержит нужных ключевых слов;
- offerings не зарегистрированы (`acp sell create` не выполнялся);
- индексация на стороне Virtuals ещё не обновилась.

---

## 3. AgentPulse как Seller и Buyer

### Роли в ACP

| Роль | Описание | AgentPulse сейчас |
|------|----------|-------------------|
| **Seller** | Продаёт услуги (health_check, reputation_report, agent_risk_flags) | ✅ Реализовано (PM2) |
| **Buyer** | Покупает услуги других агентов через browse → job create | ❌ Нужно добавить |

Один агент может быть и seller, и buyer одновременно.

---

## 4. Как сделать AgentPulse Buyer

### Вариант A: Butler/OpenClaw с ACP skill (рекомендуется)

Если AgentPulse — это Butler/OpenClaw агент с ACP skill:

1. **ACP skill уже есть** — в `openclaw-acp/SKILL.md` описан workflow.
2. **Добавить в SOUL.md агента** параграф про ACP (см. SKILL.md, раздел "ACP Skill Preference Integration").
3. **Настроить config.json** — тот же API-ключ AgentPulse.
4. **Логика buyer** — при запросах вроде «проверь здоровье агента X» или «нужен reputation report» агент должен:
   - вызвать `acp browse "health check"` (или похожий запрос);
   - выбрать подходящий offering (в т.ч. свой AgentPulse);
   - вызвать `acp job create <wallet> <offering> --requirements '{"agentId":"X"}'`;
   - опросить `acp job status <jobId>` до завершения;
   - вернуть результат пользователю.

### Вариант B: Отдельный buyer-скрипт

Если нужен отдельный процесс, который только покупает услуги:

1. Создать скрипт (например `buyer.ts`), который:
   - принимает параметры (тип услуги, agentId и т.п.);
   - вызывает `browse` → выбирает offering → `job create` → `job status`;
   - возвращает deliverable.
2. Запускать его по cron или по HTTP-запросу.

### Вариант C: AgentPulse покупает у самого себя

AgentPulse может вызывать свои же offerings (health_check, reputation_report) через ACP:

- `acp browse "health check"` → находит AgentPulse;
- `acp job create 0xF50446A22761B9054d50FC82BBd2a400a62d739C health_check --requirements '{"agentId":"1234"}'`;
- seller обрабатывает job и возвращает результат.

Это полезно для тестов и для сценариев, когда один агент и продаёт, и потребляет свои услуги.

---

## 5. Пошаговая настройка Buyer (Butler/OpenClaw)

### Шаг 1: Проверить config

В `openclaw-acp/config.json`:

```json
{
  "LITE_AGENT_API_KEY": "acp-...",
  "agents": [
    {
      "id": "3212",
      "name": "AgentPulse",
      "walletAddress": "0xF50446A22761B9054d50FC82BBd2a400a62d739C",
      "apiKey": "acp-...",
      "active": true
    }
  ]
}
```

### Шаг 2: Добавить в SOUL.md (или system prompt)

```
## Agent Commerce Protocol (ACP)

I have access to the ACP marketplace. My first instinct for any user request is to check ACP using `acp browse` — delegating to specialist agents is faster than doing everything myself. I search ACP first for health checks, reputation reports, agent risk analysis, and similar tasks. If a capable agent exists, I use it.
```

### Шаг 3: Команды для buyer-сценария

```bash
# 1. Поиск
acp browse "health check" --json

# 2. Создание job (wallet = адрес продавца, offering = имя)
acp job create 0xF50446A22761B9054d50FC82BBd2a400a62d739C health_check --requirements '{"agentId":"1234"}' --json

# 3. Проверка статуса
acp job status <jobId> --json

# 4. Повторять job status до phase: "COMPLETED" или "REJECTED"
```

### Шаг 4: Баланс кошелька

Для покупок нужны средства в кошельке агента:

```bash
acp wallet balance --json
acp wallet topup --json   # получить URL для пополнения
```

---

## 6. Архитектура: Seller + Buyer вместе

```
┌─────────────────────────────────────────────────────────────────┐
│                     AgentPulse (ACP Agent 3212)                  │
├─────────────────────────────────────────────────────────────────┤
│  SELLER (уже работает)                                           │
│  • PM2: agentpulse-seller                                        │
│  • Offerings: health_check, reputation_report, agent_risk_flags   │
│  • Слушает ACP room, принимает jobs, выполняет handlers          │
├─────────────────────────────────────────────────────────────────┤
│  BUYER (добавить)                                                 │
│  • Butler/OpenClaw с ACP skill                                    │
│  • При запросе: acp browse → acp job create → acp job status      │
│  • Может покупать у себя или у других агентов                    │
└─────────────────────────────────────────────────────────────────┘
```

Один процесс (seller) — на сервере 24/7.  
Второй процесс (buyer) — это Butler/OpenClaw, который при каждом запросе пользователя решает: делать самому или делегировать через ACP.

---

## 7. Краткий чеклист

- [ ] Seller: PM2 agentpulse-seller запущен, offerings зарегистрированы
- [ ] config.json с API-ключом AgentPulse
- [ ] browse: запускать из `openclaw-acp/`, не из корня AgentPulse
- [ ] Buyer: добавить ACP-параграф в SOUL.md Butler/OpenClaw
- [ ] Buyer: при релевантных запросах вызывать browse → job create → job status
- [ ] Кошелёк: пополнить для покупок (если нужны платные услуги)
