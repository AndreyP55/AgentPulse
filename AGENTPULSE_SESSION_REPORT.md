# Полный отчёт: AgentPulse — сессия 17.02.2026

**Для кого:** новый чат Cursor (вставь этот документ в начало диалога завтра).  
**Цель:** полный контекст — что сделали, какие исследования проводили, что нашли, что изменили, что делать дальше (сервер, новые джобы).

---

## Содержание

1. [Обзор проекта и цели](#1-обзор-проекта-и-цели)
2. [Исследования: что искали, что нашли](#2-иследования-что-искали-что-нашли)
3. [Что сделали по шагам (все изменения)](#3-что-сделали-по-шагам-все-изменения)
4. [Проблемы и решения (детально)](#4-проблемы-и-решения-детально)
5. [Структура файлов и ключевой код](#5-структура-файлов-и-ключевой-код)
6. [API endpoints (найденные, без официальной доки)](#6-api-endpoints-найденные-без-официальной-доки)
7. [Как запускать и тестировать](#7-как-запускать-и-тестировать)
8. [Деплой на сервер (VPS) — пошагово](#8-деплой-на-сервер-vps--пошагово)
9. [Как добавить новые джобы (offerings)](#9-как-добавить-новые-джобы-offerings)
10. [Планы на завтра и дальше](#10-планы-на-завтра-и-дальше)
11. [Шпаргалка для нового чата](#11-шпаргалка-для-нового-чата)

---

## 1. Обзор проекта и цели

| Пункт | Описание |
|-------|----------|
| **Проект** | **AgentPulse** — AI-агент в экосистеме Virtuals Protocol (aGDP.io). Мониторит «здоровье» других агентов и продаёт отчёты через ACP (Agent Commerce Protocol). |
| **Роль сейчас** | Только **seller** (продаём услуги). Позже планируется **buyer** (покупать услуги у других агентов). |
| **Стек** | Node.js, TypeScript, репозиторий **openclaw-acp** (CLI + seller runtime). Данные — с aGDP.io через неофициальные API. |
| **Рабочая папка** | `ПроектНовыйВиртуал` (корень). Внутри — `openclaw-acp`. **Все команды npm/openclaw выполняются из `openclaw-acp`**, не из корня. |
| **Имя агента в коде** | В runtime имя агента берётся из API (getMyAgentInfo). Папка с offerings = **sanitized name**: `AgentPulse` → `agentpulse`. Значит пути: `src/seller/offerings/agentpulse/...`. |

**Кошельки и ключи:**

- Кошелёк агента (внутренний, списание за джобы): `0xF50446A22761B9054d50FC82BBd2a400a62d739C`
- Твой кошелёк (управление/вывод): `0xdb6724f4feAf93079601c3E6aEDfE9dB5d6E0c52`
- API key агента (для openclaw): `literal:<REDACTED_API_KEY>`

**Offerings (услуги) — текущее состояние:**

| Offering | Цена | Статус | Описание |
|----------|------|--------|----------|
| `health_check` | 0.25 USDC | ✅ Сделано | Быстрая проверка: success rate, активность, health score 0–100, рекомендации. |
| `reputation_report` | 0.5 USDC | ✅ Сделано | Полный отчёт: метрики, тренды, сильные/слабые стороны, позиция в лидерборде, рекомендации. |
| `uptime_monitor_24h` | — | ⏳ Планируется | Мониторинг 24ч (позже). |

---

## 2. Исследования: что искали, что нашли

### 2.1 Откуда брать данные aGDP

- **Искали:** публичный API aGDP.io для метрик агентов (success rate, jobs, revenue, rank).
- **Результат:** официальной публичной документации нет. Страница agdp.io подгружает данные через запросы с фронта.
- **Что сделали:** открыли **DevTools → Network** на https://agdp.io (и на странице конкретного агента), посмотрели XHR/Fetch.
- **Нашли:**
  - **Метрики агента:** `https://acpx.virtuals.io/api/metrics/agent/{agentId}` — отдаёт JSON с полями: `name`, `successfulJobCount`, `revenue`, `uniqueBuyerCount`, `rating`, `lastActiveAt`, `successRate` (иногда 0 — тогда считаем оценку сами).
  - **Ранг в лидерборде:** отдельно не в этом ответе. Искали запросы со страницы лидерборда agdp.io.
- **Нашли (лидерборд):**
  - `https://api.virtuals.io/api/agdp-leaderboard-epochs/1/ranking?pagination%5BpageSize%5D=1000`
  - В ответе: `data[]` с объектами, у каждого есть `agentId`, `rank`. Эпоха **1** — текущая активная (февраль 2026).

### 2.2 Почему rank был неправильный

- **Искали:** откуда на aGDP.io берётся позиция в лидерборде (например, WhaleIntel — 4 место).
- **Проблема:** в нашем коде rank не запрашивался или подставлялся неверно (показывали 15 вместо 4).
- **Решение:** добавили отдельный запрос к API лидерборда (см. выше), поиск по `agentId` в массиве `data`, подстановка `rank` в метрики.

### 2.3 Загрузка handlers на Windows

- **Искали:** причину ошибки при динамическом `import(handlersPath)` в seller runtime.
- **Ошибка:** `ERR_UNSUPPORTED_ESM_URL_SCHEME` — на Windows с ESM путь вида `C:\...\handlers.ts` не принимается.
- **Решение:** конвертировать путь в file URL: `pathToFileURL(handlersPath).href` и делать `import(handlersURL)`.

### 2.4 Почему джоба не стартует до Ctrl+C

- **Искали:** почему заказ из Butler создаётся, но выполнение в терминале не начинается.
- **Вывод:** похоже на особенность event loop / polling в данной среде (Windows, кириллица в пути, возможно PowerShell). Локально обходились нажатием Ctrl+C — после этого джоба выполнялась.
- **Что проверить:** на VPS под Linux с PM2 такое поведение может исчезнуть.

### 2.5 Где регистрировать и как обновлять offerings

- **Искали:** как зарегистрировать новую услугу в ACP, чтобы она появилась на aGDP.io.
- **Нашли:** CLI openclaw-acp: `npx tsx bin/acp.ts sell create` — читает папки из `src/seller/offerings/<agentDir>/` и создаёт/обновляет офферы в протоколе. После этого они видны на aGDP и в Butler (app.virtuals.io).

---

## 3. Что сделали по шагам (все изменения)

1. **Скачали/распаковали openclaw-acp** в папку `openclaw-acp` внутри `ПроектНовыйВиртуал`.
2. **Установка:** из папки `openclaw-acp`: `npm install`, `npm run setup` (настройка под агента).
3. **Создали структуру offerings для AgentPulse:** папка `src/seller/offerings/agentpulse/` (имя папки = sanitized agent name: `agentpulse`).
4. **Добавили offering health_check:** `agentpulse/health_check/offering.json` + `handlers.ts`.
5. **Добавили offering reputation_report:** `agentpulse/reputation_report/offering.json` + `handlers.ts`.
6. **Добавили общий клиент aGDP:** `agentpulse/shared/agdp-client.ts` — запросы к `acpx.virtuals.io` (метрики) и `api.virtuals.io` (лидерборд), запасные варианты скрейпинга и fallback.
7. **Исправили загрузку handlers на Windows:** в `src/seller/runtime/offerings.ts` — импорт `pathToFileURL`, конвертация пути в file URL перед `import()`.
8. **Добавили зависимость:** `npm install cheerio` (в openclaw-acp) для резервного скрейпинга в agdp-client.
9. **Внедрили реальные метрики и rank:** в agdp-client — вызов API метрик и отдельно `fetchAgentRank()`; в оба handler'а передаётся и выводится `rank`.
10. **Зарегистрировали offerings в ACP:** `npx tsx bin/acp.ts sell create`.
11. **Проверка локально:** запуск `npx tsx src/seller/runtime/seller.ts`, заказ через Butler (agent_id 123 — WhaleIntel), проверка что rank = 4 и отчёты корректны.

---

## 4. Проблемы и решения (детально)

| Проблема | Где проявилось | Решение |
|----------|----------------|---------|
| ENOENT package.json | Запуск npm из корня `ПроектНовыйВиртуал` | Всегда запускать команды из папки `openclaw-acp`. |
| ERR_UNSUPPORTED_ESM_URL_SCHEME | `offerings.ts` — динамический import handlers | Импорт `pathToFileURL` из `url`; путь к `handlers.ts` конвертировать в file URL и передавать в `import(handlersURL)`. |
| Нет модуля cheerio | При запуске agdp-client (скрейпинг) | `npm install cheerio` в openclaw-acp. |
| Метрики «заглушки», не с aGDP | Результаты health_check/reputation_report | Найти через DevTools API; использовать `acpx.virtuals.io/api/metrics/agent/{agentId}` в agdp-client. |
| Неверный rank (15 вместо 4) | Отчёт для WhaleIntel (agentId 123) | Добавить запрос к `api.virtuals.io/.../agdp-leaderboard-epochs/1/ranking`, найти агента по `agentId`, подставить `rank`. |
| Джоба не выполняется до Ctrl+C | Локальный seller runtime на Windows | Пока оставлено как есть; на VPS проверить. При необходимости — разобрать event loop / сокеты. |
| Кириллица в пути (ПроектНовыйВиртуал) | PowerShell | Запускать в CMD или из папки без кириллицы. |

---

## 5. Структура файлов и ключевой код

```
openclaw-acp/
  package.json
  bin/
    acp.ts                    # CLI: sell create, serve start, и т.д.
  src/
    seller/
      runtime/
        seller.ts              # Точка входа: подключается к ACP, загружает offerings по agentDirName
        offerings.ts           # loadOffering(name, agentDirName) — здесь фикс pathToFileURL для Windows
        offeringTypes.ts       # ExecuteJobResult, OfferingHandlers, ValidationResult
        sellerApi.js            # acceptOrRejectJob, requestPayment, deliverJob
        acpSocket.ts
        types.ts
      offerings/
        agentpulse/            # папка = sanitizeAgentName("AgentPulse") => "agentpulse"
          shared/
            agdp-client.ts     # fetchAgentMetrics(agentId), fetchAgentRank (внутри), AgentMetrics (rank включён)
          health_check/
            offering.json      # name, description, jobFee 0.25, requirements.agent_id
            handlers.ts        # executeJob, validateRequirements, requestPayment
          reputation_report/
            offering.json      # jobFee 0.5, requirements.agent_id, period (optional)
            handlers.ts        # executeJob, validateRequirements, requestPayment
    lib/
      config.ts                # sanitizeAgentName(name) — lowercase, replace non-alphanumeric with "-"
      wallet.js                # getMyAgentInfo()
```

**Важно:** имя папки под `offerings/` должно совпадать с результатом `sanitizeAgentName(agentData.name)`. Для агента "AgentPulse" это `agentpulse`.

**Ключевой фрагмент (offerings.ts) — фикс Windows:**

```ts
import { fileURLToPath, pathToFileURL } from "url";
// ...
const handlersURL = pathToFileURL(handlersPath).href;
const handlers = (await import(handlersURL)) as OfferingHandlers;
```

**Контракт handler'а (offeringTypes.ts):** каждый offering должен экспортировать как минимум `executeJob(requirements): Promise<ExecuteJobResult>`. Опционально: `validateRequirements`, `requestPayment`.

---

## 6. API endpoints (найденные, без официальной доки)

| Назначение | URL | Метод | Примечание |
|------------|-----|--------|------------|
| Метрики агента | `https://acpx.virtuals.io/api/metrics/agent/{agentId}` | GET | successRate, successfulJobCount, revenue, uniqueBuyerCount, rating, lastActiveAt, name. |
| Ранг в лидерборде | `https://api.virtuals.io/api/agdp-leaderboard-epochs/1/ranking?pagination%5BpageSize%5D=1000` | GET | В теле: `data` — массив объектов с `agentId`, `rank`. Эпоха 1 — текущая. |

Запросы с заголовками типа `User-Agent: AgentPulse/1.0`, `Accept: application/json`, `Origin: https://agdp.io`, `Referer: https://agdp.io/` — работают.

---

## 7. Как запускать и тестировать

- **Терминал:** CMD предпочтительнее PowerShell (из-за кириллицы в пути).
- **Каталог:** всегда `openclaw-acp`.

```cmd
cd c:\Users\Pc\Desktop\ПроектНовыйВиртуал\openclaw-acp
npm install
npx tsx src\seller\runtime\seller.ts
```

- В Butler (app.virtuals.io) заказать health_check или reputation_report, например для `agent_id: 123` (WhaleIntel). Ожидаемый rank в отчёте — 4.
- Если локально джоба не стартует сразу — попробовать нажать Ctrl+C в терминале (как обходной путь в этой среде).
- Обновить офферы в ACP после изменения `offering.json` или добавления нового offering:

```cmd
cd openclaw-acp
npx tsx bin/acp.ts sell create
```

---

## 8. Деплой на сервер (VPS) — пошагово

Цель: seller runtime работал 24/7 на Linux (например, VPS).

1. **Сервер:** любой VPS с Node.js 18+ (Ubuntu/Debian удобно).
2. **Код:** склонировать/залить репозиторий openclaw-acp на сервер (или только папку openclaw-acp с `node_modules` и настройками). Убедиться, что там есть папка `src/seller/offerings/agentpulse/` со всеми файлами.
3. **Переменные окружения / конфиг:** на сервере должны быть заданы те же ключи/кошелёк, что и при `npm run setup` локально (как openclaw-acp хранит API key и привязку к агенту — посмотреть в `lib/config.ts` и в корне проекта файлы конфигурации). При необходимости перенести или заново выполнить `npm run setup` на сервере.
4. **Зависимости:** на сервере выполнить `npm install` в папке openclaw-acp.
5. **Запуск через PM2 (рекомендуется):**
   ```bash
   npm install -g pm2
   cd /path/to/openclaw-acp
   pm2 start "npx tsx src/seller/runtime/seller.ts" --name agentpulse-seller
   pm2 save
   pm2 startup   # автозапуск после перезагрузки
   ```
6. **Проверка:** `pm2 logs agentpulse-seller` — должны быть сообщения о подключении и "Waiting for jobs...". Создать тестовый заказ через Butler и убедиться, что джоба выполняется без Ctrl+C.
7. **Обновление кода:** после git pull или замены файлов — `pm2 restart agentpulse-seller`.

Если используешь не PM2, а systemd — описать в сервисе запуск той же команды `npx tsx src/seller/runtime/seller.ts` из каталога openclaw-acp.

---

## 9. Как добавить новые джобы (offerings)

Чтобы добавить новый тип услуги (например, `uptime_monitor_24h` или любой другой):

1. **Создать папку** под тем же агентом:  
   `openclaw-acp/src/seller/offerings/agentpulse/<имя_оффера>/`  
   Например: `agentpulse/uptime_monitor_24h/`.

2. **Добавить `offering.json`** в эту папку (по образцу health_check/reputation_report):
   - `name` — совпадает с именем папки (например, `uptime_monitor_24h`);
   - `description` — краткое описание для aGDP;
   - `jobFee` — цена в USDC (число);
   - `jobFeeType`: `"fixed"` или `"percentage"`;
   - `requiredFunds`: обычно `false`;
   - `requirements` — объект: для каждого параметра тип и `required: true/false`.  
   Пример для одного параметра:
   ```json
   {
     "name": "uptime_monitor_24h",
     "description": "24-hour uptime monitoring for an agent.",
     "jobFee": 1,
     "jobFeeType": "fixed",
     "requiredFunds": false,
     "requirements": {
       "agent_id": { "type": "string", "description": "Agent ID to monitor", "required": true }
     }
   }
   ```

3. **Добавить `handlers.ts`** в ту же папку. Обязательно экспортировать:
   - `executeJob(requirements): Promise<ExecuteJobResult>` — основная логика; возвращать `{ deliverable: результат }` (строка или объект).
   - По желанию: `validateRequirements(requirements): ValidationResult`, `requestPayment(requirements): string`.

   Импорты типов из runtime:
   ```ts
   import type { ExecuteJobResult, ValidationResult } from "../../../runtime/offeringTypes.js";
   ```
   При необходимости использовать общий клиент:
   ```ts
   import { fetchAgentMetrics } from "../shared/agdp-client.js";
   ```

4. **Зарегистрировать в ACP:** из папки openclaw-acp выполнить:
   ```cmd
   npx tsx bin/acp.ts sell create
   ```
   Новый оффер появится на aGDP.io и в Butler.

5. **Имя папки** должно быть в lowercase, без пробелов (как в существующих: `health_check`, `reputation_report`). Имя в `offering.json` должно совпадать с именем папки.

Список доступных офферов runtime берёт из `listOfferings(agentDirName)` — т.е. из подпапок `src/seller/offerings/agentpulse/`. Добавление новой папки с `offering.json` и `handlers.ts` достаточно.

---

## 10. Планы на завтра и дальше

- **Деплой на VPS:** поднять seller на сервере (см. раздел 8), проверить выполнение джоб без Ctrl+C.
- **Новые джобы:** добавить хотя бы один новый offering по шагам из раздела 9 (например, `uptime_monitor_24h` или упрощённый «mini report»).
- **Buyer:** разобрать в openclaw-acp, как агент может не только продавать, но и покупать услуги (другой агент/оффер), и реализовать сценарий для AgentPulse.
- **Улучшения (по желанию):** логирование в файл, метрики uptime, смена эпохи лидерборда (если появится эпоха 2 — обновить URL или вынести в конфиг).

---

## 11. Шпаргалка для нового чата

- **Проект:** AgentPulse на Virtuals/aGDP, openclaw-acp, только seller пока.
- **Сделано:** health_check (0.25 USDC), reputation_report (0.5 USDC); данные и rank с `acpx.virtuals.io` и `api.virtuals.io` (лидерборд эпоха 1).
- **Исправлено:** ESM import handlers на Windows (pathToFileURL в offerings.ts), реальные метрики и rank в agdp-client, зависимость cheerio.
- **Рабочая директория:** всегда `openclaw-acp`. Запуск seller: `npx tsx src/seller/runtime/seller.ts`. Регистрация офферов: `npx tsx bin/acp.ts sell create`.
- **Папка offerings:** `src/seller/offerings/agentpulse/` (agentpulse = sanitizeAgentName("AgentPulse")).
- **Дальше:** деплой на VPS (PM2), добавление новых джоб (новая папка + offering.json + handlers.ts + sell create), buyer.

Вставь этот документ в новый чат завтра — по нему можно продолжить без потери контекста.
