# Workflow: всё локально → GitHub → сервер

Цель: все изменения и настройки делать на своём компьютере, пушить в GitHub, на сервере только подтянуть код и перезапустить.

---

## Часть 1. Локально (твой ПК)

### 1.1. Папка и команды

Все команды из папки:

```powershell
cd C:\Users\Pc\Desktop\AgentPulse\openclaw-acp
```

Везде используй `npx tsx bin/acp.ts` (не `acp`).

### 1.2. Один раз: привязать проект к агенту

Если ещё не делал:

```powershell
npx tsx bin/acp.ts setup
```

Выбрать `1` (AgentPulse). В папке появится `config.json` с API-ключом.

**Важно:** `config.json` в .gitignore — в GitHub его не пушить (ключ не должен попадать в репозиторий).

### 1.3. Регистрация в ACP (тоже локально)

Эти команды обращаются к API Virtuals и регистрируют агента и offerings в облаке. Делаешь их один раз (или когда меняешь описание/offerings):

```powershell
npx tsx bin/acp.ts profile update description "AgentPulse: health check, reputation report, and risk flags for AI agents on Virtuals Protocol (agdp.io). Check agent status, metrics, success rate, revenue, rank. Triggers: agent health, agent status, reputation, risk flags, due diligence. For agents (JSON) and humans (human_summary)." --json
```

```powershell
npx tsx bin/acp.ts sell create health_check
npx tsx bin/acp.ts sell create reputation_report
npx tsx bin/acp.ts sell create agent_risk_flags
```

Проверка:

```powershell
npx tsx bin/acp.ts sell list
```

### 1.4. Редактирование кода

Меняешь что нужно в репозитории (handlers, offering.json, SKILL.md и т.д.) — всё локально.

### 1.5. (По желанию) Проверка локально

```powershell
npx tsx bin/acp.ts serve start
```

Проверяешь, что сервис отвечает. Потом:

```powershell
npx tsx bin/acp.ts serve stop
```

### 1.6. Пуш в GitHub

```powershell
cd C:\Users\Pc\Desktop\AgentPulse
git add .
git status
```

Убедись, что в коммит не попадает `openclaw-acp/config.json` (он должен быть в .gitignore).

```powershell
git commit -m "AgentPulse: обновления offerings / описание"
git push
```

---

## Часть 2. На сервере

Здесь только подтянуть код и перезапустить процесс. **Не нужно** снова запускать `acp setup` или `acp sell create` — они уже сделаны локально, данные в облаке ACP.

### 2.1. Подключиться по SSH

```bash
ssh root@literal:<REDACTED_SERVER_IP>
```

(или твой пользователь/хост)

### 2.2. Перейти в папку и подтянуть код

```bash
cd /root/AgentPulse
git pull
cd openclaw-acp
```

### 2.3. Зависимости (если менялся package.json)

```bash
npm install
```

### 2.4. config.json на сервере

На сервере должен быть свой `config.json` с тем же API-ключом (LITE_AGENT_API_KEY), что и на ПК. Обычно его создают один раз при первом деплое (вручную или из deploy-from-scratch.sh) и не трогают. Не качай его из GitHub.

### 2.5. Перезапустить seller

```bash
pm2 restart agentpulse-seller
```

Или, если процесс ещё не был добавлен в PM2:

```bash
pm2 start "npx tsx src/seller/runtime/seller.ts" --name agentpulse-seller
pm2 save
```

---

## Кратко

| Где      | Что делать |
|----------|------------|
| **Локально** | Редактировать код, `acp setup`, `profile update`, `sell create`, тест `serve start`, потом `git push`. |
| **GitHub**   | Хранит код. config.json не пушить. |
| **Сервер**   | `git pull`, при необходимости `npm install`, `pm2 restart agentpulse-seller`. Без повторного acp setup/sell create. |

Всё настройки и регистрация — локально. Сервер только тянет код из GitHub и крутит seller.
