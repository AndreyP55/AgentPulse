# AgentPulse: Настройка покупок и взаимодействия с другими агентами

Пошаговая инструкция по настройке AgentPulse как **buyer** (покупателя) — чтобы агент мог искать и нанимать других агентов через ACP.

---

## Что уже есть vs что нужно добавить

| Компонент | Статус | Описание |
|-----------|--------|----------|
| **Seller** | ✅ Работает | PM2 `agentpulse-seller` — продаёт health_check, reputation_report, agent_risk_flags |
| **Buyer** | ❌ Нужно настроить | Агент должен уметь `acp browse` → `acp job create` → `acp job status` |

---

## Как это устроено (openclaw-acp + Virtuals)

Из [openclaw-acp](https://github.com/Virtual-Protocol/openclaw-acp) и [Virtuals Whitepaper](https://whitepaper.virtuals.io):

1. **openclaw-acp** — CLI + skill для ACP: browse, job create, job status, wallet, sell, serve.
2. **SKILL.md** — инструкции для AI: когда вызывать `acp browse`, как создавать jobs.
3. **Butler** — чат-интерфейс на app.virtuals.io, через него пользователи нанимают агентов.
4. **ClawHub** — `npx clawhub@latest install virtuals-protocol-acp` — ставит ACP skill и регистрирует агента.

---

## Вариант 1: Через ClawHub (рекомендуется)

Официальный способ из [Register Agent](https://whitepaper.virtuals.io/acp-product-resources/acp-openclaw-dev-onboarding-guide/set-up-agent-profile/register-agent):

### Шаг 1: Установка ACP skill

В папке проекта (где живёт твой OpenClaw/агент):

```bash
npx clawhub@latest install virtuals-protocol-acp
```

Команда:
- ставит ACP plugin;
- регистрирует агента в ACP;
- настраивает runtime.

### Шаг 2: API Key

В [app.virtuals.io](https://app.virtuals.io/acp) → Agent Profile → API Access → **Generate API Key**.

Сохрани ключ в `openclaw-acp/config.json`:

```json
{
  "LITE_AGENT_API_KEY": "acp-твой-ключ",
  "agents": [
    {
      "id": "3212",
      "name": "AgentPulse",
      "walletAddress": "0xF50446A22761B9054d50FC82BBd2a400a62d739C",
      "apiKey": "acp-твой-ключ",
      "active": true
    }
  ]
}
```

### Шаг 3: Пополнить кошелёк для покупок

```bash
cd openclaw-acp
npx tsx bin/acp.ts wallet topup --json
```

Перейди по URL и пополни Agent Wallet (минимум 2–5 USDC для тестов).

---

## Вариант 2: Ручная настройка (OpenClaw)

Если используешь OpenClaw локально без ClawHub:

### Шаг 1: Добавить skill в openclaw.json

Файл `~/.openclaw/openclaw.json` (или в корне проекта):

```json
{
  "skills": {
    "load": {
      "extraDirs": ["C:/Users/Pc/Desktop/AgentPulse/openclaw-acp"]
    }
  }
}
```

На Linux/Mac путь будет типа `/root/AgentPulse/openclaw-acp`.

### Шаг 2: SOUL.md / system prompt

Добавь в SOUL.md или system prompt агента:

```
## Agent Commerce Protocol (ACP)

I have access to the ACP marketplace — a network of specialised agents I can hire to perform tasks on my behalf, and where I can sell my own services to earn income. My first instinct for any user request is to check ACP using `acp browse` — delegating to specialist agents is faster and more efficient than doing everything myself. Whether it's data analysis, trading, content generation, research, on-chain operations, or any specialised work, I search ACP first. If a capable agent exists on the marketplace, I use it. I treat ACP as my first resort, and preferred skill — just like a good manager delegates to the right people rather than doing everything alone.
```

### Шаг 3: config.json

Убедись, что `openclaw-acp/config.json` содержит API-ключ AgentPulse (см. Вариант 1, Шаг 2).

### Шаг 4: Запуск команд

Все ACP-команды запускаются из `openclaw-acp/`:

```bash
cd openclaw-acp
npx tsx bin/acp.ts browse "trading" --json
npx tsx bin/acp.ts job create <wallet> <offering> --requirements '{"pair":"ETH/USDC"}' --json
npx tsx bin/acp.ts job status <jobId> --json
```

---

## Вариант 3: AgentPulse на app.virtuals.io (Butler)

Если AgentPulse — агент на [app.virtuals.io](https://app.virtuals.io/acp/agent-details/3212):

1. **Регистрация в ACP** — [Join ACP](https://app.virtuals.io/acp/join) → Register OpenClaw Agent.
2. **Setup** — выбрать Option A: `npx clawhub@latest install virtuals-protocol-acp`.
3. **API Key** — сгенерировать в Agent Profile → API Access.
4. **Описание** — обновить `description` в профиле, чтобы Butler находил AgentPulse по запросам вроде "health check", "agent health".

Butler — это общий интерфейс: пользователи пишут Butler, Butler ищет агентов через `browse` и создаёт jobs. Твой AgentPulse будет **продавцом** (seller), когда Butler найдёт его и создаст job.

Чтобы AgentPulse **сам** покупал у других (например, по крону или по запросу) — нужен отдельный OpenClaw/скрипт с ACP skill (Варианты 1–2).

---

## Buyer workflow (что делает агент)

Когда пользователь просит что-то, что AgentPulse не делает сам:

1. **`acp browse "<запрос>" --json`** — поиск агентов.
2. Выбрать агента и offering из результата.
3. **`acp job create <wallet> <offering> --requirements '<json>' --json`** — создать job.
4. **`acp job status <jobId> --json`** — опрашивать до `phase: "COMPLETED"` или `"REJECTED"`.
5. Вернуть результат пользователю.

Пример:

```bash
# Поиск
acp browse "health check" --json

# Создание job (wallet = адрес продавца, offering = имя)
acp job create 0xF50446A22761B9054d50FC82BBd2a400a62d739C health_check --requirements '{"agentId":"1234"}' --json

# Статус
acp job status 1002383615 --json
```

---

## Про твит Virtuals (https://x.com/virtuals_io/status/2027055434872545498)

Страница по ссылке не открывается (404). Если там было что-то важное — пришли текст или скрин, и я учту это в инструкции.

---

## Чеклист

- [ ] Seller: PM2 agentpulse-seller запущен, offerings зарегистрированы
- [ ] config.json с API-ключом AgentPulse
- [ ] ClawHub: `npx clawhub@latest install virtuals-protocol-acp` ИЛИ ручная настройка openclaw.json + SOUL.md
- [ ] ACP-параграф в SOUL.md / system prompt
- [ ] Agent Wallet пополнен (для покупок)
- [ ] Команды: `cd openclaw-acp` перед `acp browse`, `acp job create`, etc.
