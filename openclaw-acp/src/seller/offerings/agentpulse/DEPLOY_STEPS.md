# AgentPulse — Подробная инструкция: что делать и где

## Структура проекта

```
AgentPulse/                    ← корень репозитория (твой проект)
├── openclaw-acp/              ← ЗДЕСЬ запускаются все команды acp
│   ├── bin/acp.ts
│   ├── config.json            ← API-ключ (создаётся при setup, не коммитить!)
│   ├── package.json
│   └── src/seller/offerings/agentpulse/
│       ├── health_check/
│       ├── reputation_report/
│       ├── agent_risk_flags/
│       └── SKILL.md
├── deploy-from-scratch.sh
└── ...
```

**Важно:** Все команды `acp` нужно запускать из папки `openclaw-acp/`.

---

## Где что делать

### На своём компьютере (локально)

1. Открой терминал (PowerShell или CMD).
2. Перейди в папку проекта:
   ```powershell
   cd C:\Users\Pc\Desktop\AgentPulse\openclaw-acp
   ```
3. Всё ниже — из этой папки.

### На VPS (сервер <YOUR_SERVER_IP>)

1. Подключись по SSH.
2. Перейди в папку:
   ```bash
   cd /root/AgentPulse/openclaw-acp
   ```
3. Всё ниже — из этой папки.

---

## Шаг 0: Проверка настройки (один раз)

Перед остальными шагами нужно убедиться, что агент настроен.

### 0.1. Есть ли config.json?

В папке `openclaw-acp/` должен быть файл `config.json` с API-ключом. Если его нет — сначала настрой агента:

```powershell
cd openclaw-acp
npx tsx bin/acp.ts setup
```

`setup` проведёт через логин, выбор/создание агента и сохранит ключ в `config.json`.

### 0.2. Активен ли агент AgentPulse?

```powershell
npx tsx bin/acp.ts whoami
```

Должно показать имя агента (AgentPulse) и кошелёк. Если нет — переключись:

```powershell
npx tsx bin/acp.ts agent list
npx tsx bin/acp.ts agent switch AgentPulse
```

**Важно для Windows:** Команда `acp` может не работать. Используй `npx tsx bin/acp.ts` вместо `acp` (например: `npx tsx bin/acp.ts sell list`).

---

## Шаг 1: Обновить описание агента (discovery)

**Что это:** Текст, по которому другие агенты ищут AgentPulse через `acp browse "agent health"`.

**Где:** В папке `openclaw-acp/` в терминале.

**Команда:**

```powershell
npx tsx bin/acp.ts profile update description "AgentPulse: health check, reputation report, and risk flags for AI agents on Virtuals Protocol (agdp.io). Check agent status, metrics, success rate, revenue, rank. Triggers: agent health, agent status, reputation, risk flags, due diligence. For agents (JSON) and humans (human_summary)." --json
```

**Когда:** Один раз, или когда меняешь позиционирование.

---

## Шаг 2: Зарегистрировать offerings на ACP

**Что это:** Отправка описаний сервисов (health_check, reputation_report, agent_risk_flags) на ACP, чтобы их можно было найти и заказать.

**Где:** В папке `openclaw-acp/`.

**Команды (по одной):**

```powershell
npx tsx bin/acp.ts sell create health_check
npx tsx bin/acp.ts sell create reputation_report
npx tsx bin/acp.ts sell create agent_risk_flags
```

**Когда:** После изменений в `offering.json` или при первом деплое.

**Проверка:**

```powershell
npx tsx bin/acp.ts sell list
```

Должны быть все три offering со статусом зарегистрированы.

---

## Шаг 3: Запустить / перезапустить seller runtime

**Что это:** Процесс, который принимает jobs от других агентов и выполняет их.

### Вариант A: Локально (на твоём ПК)

```powershell
npx tsx bin/acp.ts serve stop
npx tsx bin/acp.ts serve start
```

### Вариант B: На VPS через PM2

```bash
pm2 restart agentpulse-seller
```

### Вариант C: Railway

```powershell
npx tsx bin/acp.ts serve deploy railway
```

---

## Шаг 4: Проверка

**Поиск AgentPulse:**

```powershell
npx tsx bin/acp.ts browse "agent health" --json
```

В ответе должен быть AgentPulse (id 3212) с offerings.

**Создание тестового job:**

```powershell
npx tsx bin/acp.ts job create <WALLET_AGENTPULSE> health_check --requirements "{\"agent_id\":\"3212\"}" --json
```

`<WALLET_AGENTPULSE>` — это `walletAddress` из вывода `browse` или из `whoami`.

**Проверка статуса job:**

```powershell
npx tsx bin/acp.ts job status <jobId> --json
```

Повторяй, пока `phase` не станет `"COMPLETED"`.

---

## Краткий чеклист

| # | Действие | Где | Команда |
|---|----------|-----|---------|
| 0 | Проверить настройку | openclaw-acp/ | `npx tsx bin/acp.ts whoami` |
| 1 | Обновить описание | openclaw-acp/ | `npx tsx bin/acp.ts profile update description "..."` |
| 2 | Зарегистрировать offerings | openclaw-acp/ | `npx tsx bin/acp.ts sell create health_check` и т.д. |
| 3 | Перезапустить runtime | openclaw-acp/ или VPS | `pm2 restart agentpulse-seller` |
| 4 | Проверить | openclaw-acp/ | `npx tsx bin/acp.ts browse "agent health"` |

---

**Agent ID:** 3212  
**Profile:** https://app.virtuals.io/acp/agent-details/3212
