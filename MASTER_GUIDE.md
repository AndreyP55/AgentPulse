# 🦞 МАСТЕР-ГАЙД: Создание AI агента на Virtuals Protocol с ACP

**Полная инструкция от нуля до работающего агента с заработком**

---

## 📋 Оглавление

1. [Введение и концепции](#введение-и-концепции)
2. [Архитектура системы](#архитектура-системы)
3. [Подготовка к созданию агента](#подготовка-к-созданию-агента)
4. [Создание и токенизация агента](#создание-и-токенизация-агента)
5. [Структура проекта](#структура-проекта)
6. [Создание Skills (скиллов)](#создание-skills-скиллов)
7. [Создание Offerings (услуг)](#создание-offerings-услуг)
8. [Настройка ACP](#настройка-acp)
9. [Регистрация offerings](#регистрация-offerings)
10. [Запуск Seller Runtime](#запуск-seller-runtime)
11. [Деплой на VPS](#деплой-на-vps)
12. [Тестирование и мониторинг](#тестирование-и-мониторинг)
13. [Troubleshooting](#troubleshooting)
14. [Чеклист](#чеклист)

---

## Введение и концепции

### Что такое Virtuals Protocol?

**Virtuals Protocol** - это платформа для создания и токенизации AI агентов:
- Создаешь AI агента с уникальным функционалом
- Токенизируешь его (запускаешь токен)
- Агент может зарабатывать, предоставляя услуги

### Что такое ACP (Agent Commerce Protocol)?

**ACP** - это протокол для коммерции между агентами:
- Агенты могут покупать услуги у других агентов
- Агенты могут продавать свои услуги (и зарабатывать!)
- Все транзакции on-chain на Base blockchain

### Что такое aGDP.io?

**aGDP.io** - это marketplace где:
- Показываются все агенты с их services
- Можно нанять агента для задачи
- Отображается статистика заработка

### Ключевые компоненты:

```
┌─────────────────────────────────────────────────────────┐
│  Virtuals Protocol (app.virtuals.io)                    │
│  - Создание агента                                      │
│  - Токенизация агента                                   │
│  - Wallet Management                                    │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────┐
│  ACP (Agent Commerce Protocol)                          │
│  - Регистрация services (offerings)                     │
│  - Marketplace для агентов                              │
│  - Обработка платежей                                   │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ↓
┌─────────────────────────────────────────────────────────┐
│  aGDP.io (agdp.io)                                      │
│  - Отображение агентов и skills                         │
│  - Job Log (история заданий)                            │
│  - Статистика заработка                                 │
└─────────────────────────────────────────────────────────┘
```

---

## Архитектура системы

### Как работает агент-продавец:

```
1. Ты создаешь Offerings (услуги)
   ↓
2. Регистрируешь их в ACP Marketplace
   ↓
3. Запускаешь Seller Runtime (WebSocket сервер)
   ↓
4. Другой агент находит твою услугу в Marketplace
   ↓
5. Покупает услугу (платит USDC)
   ↓
6. ACP отправляет Job на твой Seller Runtime
   ↓
7. Твой Handler обрабатывает job (выполняет задачу)
   ↓
8. Возвращает результат покупателю
   ↓
9. USDC приходит на твой Agent Wallet
   ↓
10. Job отображается в Job Log на aGDP.io
```

### Компоненты проекта:

**Skills** - инструкции для агента (что он умеет делать)
- Файлы `SKILL.md` в папке `skills/`
- Описывают возможности агента
- НЕ обязательны для ACP, но полезны для документации

**Offerings** - услуги которые агент продает
- Папки с `offering.json` и `handlers.ts`
- Регистрируются в ACP Marketplace
- ОБЯЗАТЕЛЬНЫ для работы агента-продавца

**Handlers** - код который выполняется при покупке услуги
- Функция `executeJob(requirements)` - главная логика
- Функция `validateRequirements(requirements)` - валидация входных данных
- Возвращает результат покупателю

**Seller Runtime** - WebSocket сервер для приема jobs
- Подключается к ACP через WebSocket
- Слушает входящие jobs
- Вызывает handlers для обработки
- Отправляет результаты обратно

---

## Подготовка к созданию агента

### Что нужно ПЕРЕД началом:

#### 1. Идея агента

Определи:
- **Что будет делать агент?** (например: анализ токенов, генерация контента, etc.)
- **Какие услуги он будет продавать?** (3-5 offerings)
- **Кто будет клиентами?** (другие агенты, люди через Butler)

#### 2. Технические требования

✅ **Node.js** v18+ установлен
✅ **npm** установлен
✅ **Git** (опционально, для деплоя)
✅ **Кошелек MetaMask** с ETH на Base (~$5-10 для gas)

#### 3. Аккаунты

✅ Аккаунт на **app.virtuals.io**
✅ Кошелек подключен к Virtuals
✅ Немного ETH на Base для gas fees

---

## Создание и токенизация агента

### Шаг 1: Создание агента на Virtuals

1. **Перейди**: https://app.virtuals.io
2. **Подключи MetaMask** кошелек
3. **Нажми "Create Agent"** или "Launch Agent"
4. **Заполни форму:**
   - Name: имя агента (например: TokenAnalyzer)
   - Description: описание что делает
   - Avatar: картинка агента
   - Twitter (опционально)
   - Website (опционально)

5. **Подтверди транзакцию** в MetaMask (gas fee)

6. **Агент создан!** Получишь:
   - Страницу агента: `app.virtuals.io/prototypes/0x...`
   - Agent ID на aGDP.io

### Шаг 2: Токенизация (опционально)

Если хочешь запустить токен агента:

1. **На странице агента** → "Launch Token"
2. **Укажи:**
   - Symbol: тикер токена (например: ANLZ)
   - Initial Supply: количество токенов
3. **Подтверди** транзакцию
4. **Токен запущен** на Bonding Curve
5. **После 42K VIRTUAL** → graduation на Uniswap

### Шаг 3: Получение API ключа

1. **На странице агента** → "Configure Agent"
2. **Найди "Terminal API"** или "API Access"
3. **Скопируй API ключ** (формат: `acp-xxxxx...`)
4. **Сохрани** - понадобится позже

### Шаг 4: Agent Wallet

Виртуалс автоматически создает **внутренний кошелек** для агента.

**Важно понимать:**
- **Agent Wallet (internal)**: `0x324e...` - без приватного ключа, только вывод средств
- **Your MetaMask Wallet**: `0xb855...` - твой личный кошелек с приватным ключом

Для ACP нужен кошелек с приватным ключом → используй свой MetaMask!

---

## Структура проекта

### Создание базовой структуры:

```
YourAgentProject/
├── skills/                      # Скиллы (документация)
│   ├── skill-1/
│   │   └── SKILL.md
│   ├── skill-2/
│   │   └── SKILL.md
│   └── skill-3/
│       └── SKILL.md
│
├── offerings/                   # Offerings (шаблоны для копирования)
│   ├── offering-1/
│   │   ├── offering.json
│   │   └── handlers.ts
│   ├── offering-2/
│   │   ├── offering.json
│   │   └── handlers.ts
│   └── offering-3/
│       ├── offering.json
│       └── handlers.ts
│
├── openclaw-acp/               # ACP CLI (клонированный репозиторий)
│   ├── src/seller/offerings/
│   │   └── youragent/          # ← Сюда копируются offerings
│   ├── config.json             # Конфигурация агента (создается при setup)
│   ├── package.json
│   └── bin/acp.ts
│
├── src/                        # Исходный код утилит
│   ├── types/
│   ├── utils/
│   └── index.ts
│
├── .env                        # Секретные ключи (НЕ коммитить!)
├── .env.example                # Пример .env
├── .gitignore
├── package.json
├── tsconfig.json
├── README.md
└── DEPLOYMENT.md
```

### Файлы конфигурации:

**package.json** - npm конфигурация с зависимостями

**tsconfig.json** - настройки TypeScript

**.env** - переменные окружения (API ключи, приватные ключи)

**.gitignore** - что не коммитить в Git

---

## Создание Skills (скиллов)

### Что такое Skill?

**Skill** - это описание возможности агента в формате `SKILL.md`

Это НЕ код, а **инструкции и документация**.

### Структура SKILL.md:

```markdown
---
name: Skill Name
description: Short description
version: 1.0.0
author: Your Agent Name
category: category-name
tags:
  - tag1
  - tag2
---

# Skill Name

## Purpose
Что делает этот скилл

## Capabilities
Список возможностей

## How to Use
Как использовать

## Output Format
Какой формат результата

## Dependencies
Что нужно для работы

## Example Usage
Примеры кода
```

### Пример создания Skill:

**skills/token-analysis/SKILL.md:**

```markdown
---
name: Token Analysis
description: Analyze tokens on Base blockchain
version: 1.0.0
author: YourAgent
category: analytics
tags:
  - token
  - analysis
  - blockchain
---

# Token Analysis Skill

## Purpose
Analyzes tokens to provide price, volume, liquidity data.

## Capabilities
- Get token price
- Calculate volume
- Check liquidity
- Assess safety

## How to Use
```typescript
const analysis = await analyzeToken('0x...');
```

## Output Format
```json
{
  "price": 0.001,
  "volume24h": 100000,
  "liquidity": 50000,
  "safetyScore": 85
}
```
```

### Сколько Skills создавать?

**3-5 skills** оптимально для начала.

Каждый skill = одна группа возможностей.

---

## Создание Offerings (услуг)

### Что такое Offering?

**Offering** - это услуга которую агент продает:
- Имеет цену (в USDC)
- Имеет входные параметры (requirements)
- Выполняется handler'ом (код)
- Результат отправляется покупателю

### Структура offering:

```
offerings/your-offering/
├── offering.json    # Описание услуги
└── handlers.ts      # Код обработки
```

### offering.json формат:

```json
{
  "name": "your_offering_name",
  "description": "What this service does",
  "jobFee": 1.0,
  "jobFeeType": "fixed",
  "requiredFunds": false,
  "requirements": {
    "param1": {
      "type": "string",
      "description": "Description of param1",
      "required": true
    },
    "param2": {
      "type": "number",
      "description": "Description of param2",
      "required": false
    }
  }
}
```

**Обязательные поля:**
- `name` - LOWERCASE, только буквы, цифры, подчеркивания
- `description` - описание услуги
- `jobFee` - цена (число)
- `jobFeeType` - "fixed" или "percentage"
- `requiredFunds` - true/false (нужен ли дополнительный перевод токенов)

### handlers.ts формат:

```typescript
/**
 * Handler for Your Offering
 * Price: X USDC
 */

export async function executeJob(requirements: any) {
  console.log('[Your Offering] Starting...');
  
  // Извлечь параметры (поддержка snake_case и camelCase)
  const param1 = requirements.param1 || requirements.param_1;
  
  try {
    // ТВОЯ ЛОГИКА ЗДЕСЬ
    const result = {
      // твои данные
      success: true,
      data: { /* ... */ },
      timestamp: Date.now()
    };
    
    console.log('[Your Offering] Completed');
    
    // ОБЯЗАТЕЛЬНО return результат!
    return result;
    
  } catch (error) {
    console.error('[Your Offering] Error:', error);
    throw new Error(`Failed: ${error.message}`);
  }
}

// Опционально: валидация входных данных
export function validateRequirements(requirements: any): boolean {
  const param1 = requirements.param1 || requirements.param_1;
  
  if (!param1) {
    throw new Error('param1 is required');
  }
  
  // Дополнительные проверки...
  
  return true;
}
```

**ВАЖНО:**
- `executeJob` - ОБЯЗАТЕЛЬНАЯ функция, должна быть export
- Должна возвращать результат через `return`
- Requirements могут приходить в snake_case (`param_1`) или camelCase (`param1`)
- Всегда обрабатывай оба варианта!

### Сколько Offerings создавать?

**3-5 offerings** для старта:
- Offering 1: Основная услуга (цена: 0.5-2 USDC)
- Offering 2: Быстрая проверка (цена: 0.1-0.5 USDC)
- Offering 3: Детальный отчет (цена: 1-5 USDC)

---

## Настройка ACP

### Шаг 1: Клонирование openclaw-acp

**НЕ устанавливай глобально!** Работаем локально.

1. **Скачай репозиторий:**
   - Перейди: https://github.com/Virtual-Protocol/openclaw-acp
   - Нажми "Code" → "Download ZIP"
   
2. **Распакуй в проект:**
   ```
   YourAgentProject/openclaw-acp/
   ```

3. **Установи зависимости:**
   
   Открой CMD в папке `openclaw-acp`:
   
   ```cmd
   cd openclaw-acp
   npm install
   ```

### Шаг 2: Запуск setup

В CMD в папке `openclaw-acp`:

```cmd
npm run setup
```

**Мастер setup попросит:**

#### Вопрос 1: Авторизация

```
Step 1: Log in to app.virtuals.io
Opening browser...
```

**Действие:**
- Откроется браузер
- Залогинься через MetaMask (твой ЛИЧНЫЙ кошелек!)
- Подтверди авторизацию
- Вернись в CMD

#### Вопрос 2: Выбор агента

```
You have X agent(s):
[1] YourAgent
    Wallet: 0x...
[2] Create a new agent

Select agent [1-2]:
```

**Действие:**
- Если видишь своего агента в списке → введи его номер
- Если НЕ видишь → значит залогинен через другой кошелек!
- Проверь что в браузере подключен правильный кошелек
- Перезапусти `npm run setup`

#### Вопрос 3: Токен (опционально)

```
Launch your agent token now? (y/n):
```

**Действие:**
- Если уже запустил токен → введи `n`
- Если еще нет → введи `y` (но можно и позже)

#### Вопрос 4: Preferred Skill

```
Make ACP your preferred skill? (y/n):
```

**Действие:**
- Введи `y` (рекомендуется)

#### Результат setup:

```
✅ Setup complete!
Agent: YourAgent
Wallet: 0x...
API Key: acp-xxxxx (saved to config.json)
```

### Шаг 3: Проверка config.json

После setup создастся файл `openclaw-acp/config.json`:

```json
{
  "SESSION_TOKEN": { "token": "..." },
  "agents": [
    {
      "id": 1234,
      "name": "YourAgent",
      "walletAddress": "0x...",
      "active": true,
      "apiKey": "acp-xxxxx"
    }
  ],
  "LITE_AGENT_API_KEY": "acp-xxxxx"
}
```

**Этот файл КРИТИЧЕСКИ ВАЖЕН** - без него seller runtime не работает!

---

## Регистрация offerings

### Шаг 1: Создание шаблона offering

В CMD в папке `openclaw-acp`:

```cmd
npx tsx bin/acp.ts sell init your-offering-name
```

Это создаст:
```
src/seller/offerings/youragent/your-offering-name/
├── offering.json
└── handlers.ts
```

### Шаг 2: Заполнение offering.json

Отредактируй `offering.json`:

```json
{
  "name": "your_offering_name",
  "description": "What this service does",
  "jobFee": 1.0,
  "jobFeeType": "fixed",
  "requiredFunds": false,
  "requirements": {
    "inputParam": {
      "type": "string",
      "description": "Input parameter",
      "required": true
    }
  }
}
```

**ВАЖНО:**
- `name` ДОЛЖНО быть lowercase с подчеркиваниями!
- `jobFee` - число (цена в USDC)
- `requiredFunds` - почти всегда `false`

### Шаг 3: Реализация handlers.ts

```typescript
export async function executeJob(requirements: any) {
  // Читай параметры (оба варианта!)
  const inputParam = requirements.inputParam || requirements.input_param;
  
  console.log('[Your Service] Starting...');
  
  try {
    // ТВОЯ ЛОГИКА
    const result = {
      success: true,
      data: "your result here",
      timestamp: Date.now()
    };
    
    // ОБЯЗАТЕЛЬНО return!
    return result;
    
  } catch (error) {
    console.error('[Your Service] Error:', error);
    throw error;
  }
}

export function validateRequirements(requirements: any): boolean {
  const inputParam = requirements.inputParam || requirements.input_param;
  
  if (!inputParam) {
    throw new Error('inputParam is required');
  }
  
  return true;
}
```

### Шаг 4: Регистрация offering в ACP

```cmd
npx tsx bin/acp.ts sell create your-offering-name
```

**Что происходит:**
1. Валидация `offering.json` и `handlers.ts`
2. Если ошибки → исправь и запусти снова
3. Если OK → Offering регистрируется on-chain на Base
4. Offering появляется в ACP Marketplace
5. Через 5-10 минут → появляется на aGDP.io

**Проверка:**

```cmd
npx tsx bin/acp.ts sell list
```

Должен показать:
```
✅ your_offering_name - X USDC - Listed
```

### Шаг 5: Повтори для всех offerings

Для каждой услуги:
1. `npx tsx bin/acp.ts sell init offering-name`
2. Отредактируй offering.json
3. Реализуй handlers.ts
4. `npx tsx bin/acp.ts sell create offering-name`

---

## Запуск Seller Runtime

### Что такое Seller Runtime?

**WebSocket сервер** который:
- Подключается к ACP Marketplace
- Слушает входящие jobs
- Вызывает твои handlers
- Отправляет результаты покупателям

### Запуск локально (для теста):

В CMD в папке `openclaw-acp`:

```cmd
npx tsx src/seller/runtime/seller.ts
```

Должен показать:
```
[seller] Agent: YourAgent
[seller] Available offerings: offering1, offering2, offering3
[seller] Seller runtime is running. Waiting for jobs...
[socket] Connected to ACP
[socket] Joined ACP room
```

**Оставь это окно открытым** - runtime должен работать постоянно!

### Что происходит при получении job:

```
1. Другой агент покупает услугу
   ↓
2. ACP отправляет job через WebSocket
   ↓
[socket] onNewTask jobId=123 phase=REQUEST
[seller] New task jobId=123 phase=REQUEST
[seller] Executing offering "your_offering" for job 123...
[Your Service] Starting...
[Your Service] Completed
[sellerApi] deliverJob jobId=123
   ↓
3. Результат доставлен покупателю
4. USDC приходит на твой кошелек
5. Job появляется в Job Log на aGDP.io
```

### Остановка runtime:

- **Ctrl+C** в окне CMD
- Или закрыть окно
- Или `taskkill /F /IM node.exe`

---

## Деплой на VPS

### Зачем нужен VPS?

Seller runtime должен работать **24/7** чтобы принимать заказы.

На локальном компьютере:
- ❌ Нужно держать включенным
- ❌ Перезагрузка = downtime
- ❌ Нестабильный интернет = пропущенные jobs

На VPS:
- ✅ Работает 24/7
- ✅ Стабильный uptime
- ✅ Профессиональный хостинг

### Выбор VPS:

**Рекомендуемые провайдеры:**

1. **DigitalOcean** (проще всего)
   - Цена: $6/месяц
   - Droplet: 1GB RAM, 1 vCPU
   - https://www.digitalocean.com

2. **Hetzner Cloud** (дешевле)
   - Цена: €4.51/месяц
   - CX11: 2GB RAM, 1 vCPU
   - https://www.hetzner.com/cloud

3. **AWS Lightsail**
   - Цена: $5/месяц
   - Instance: 512MB RAM
   - https://aws.amazon.com/lightsail

**Требования:**
- CPU: 1 vCPU (достаточно)
- RAM: 1GB (минимум), 2GB (рекомендуется)
- Storage: 25GB SSD
- OS: **Ubuntu 22.04 LTS**

### Настройка VPS (пошагово):

#### 1. Создание сервера

На DigitalOcean (пример):
1. Зарегистрируйся / Залогинься
2. "Create" → "Droplets"
3. Выбери:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic $6/mo
   - **Region**: ближайший к тебе
   - **Authentication**: SSH Key (создай или используй пароль)
4. Создай Droplet
5. Получишь **IP адрес** (например: `123.45.67.89`)

#### 2. Подключение к серверу

**Через PuTTY (Windows):**

1. Скачай PuTTY: https://www.putty.org
2. Открой PuTTY
3. Host Name: `123.45.67.89` (твой IP)
4. Port: `22`
5. Connection type: SSH
6. Нажми "Open"
7. Login as: `root`
8. Password: (если используешь, или SSH key)

**Или через PowerShell/CMD:**

```powershell
ssh root@123.45.67.89
```

#### 3. Установка Node.js на сервере

В SSH терминале:

```bash
# Обновить систему
apt update && apt upgrade -y

# Установить Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# Проверить
node --version  # v20.x.x
npm --version
```

#### 4. Установка PM2 (Process Manager)

```bash
npm install -g pm2
```

PM2 - это менеджер процессов который:
- Держит seller runtime запущенным 24/7
- Автоматически перезапускает при падении
- Запускается при перезагрузке сервера
- Показывает логи

#### 5. Загрузка проекта на сервер

**Вариант A: Через FileZilla (проще)**

1. Скачай FileZilla: https://filezilla-project.org
2. Подключись:
   - Host: `sftp://123.45.67.89`
   - Username: `root`
   - Password: твой пароль
   - Port: 22
3. Перетащи папку `openclaw-acp` с компьютера на сервер в `/root/`

**Вариант B: Через SCP (командная строка)**

На локальном компьютере в PowerShell:

```powershell
# Создать архив
cd C:\Users\Pc\Desktop\YourAgentProject
tar -czf openclaw-acp.tar.gz openclaw-acp

# Загрузить на сервер
scp openclaw-acp.tar.gz root@123.45.67.89:/root/

# На сервере распаковать
ssh root@123.45.67.89
cd /root
tar -xzf openclaw-acp.tar.gz
```

**Вариант C: Через Git**

```bash
# На сервере
cd /root
git clone <url-твоего-репозитория> openclaw-acp
cd openclaw-acp
```

#### 6. Установка зависимостей на сервере

```bash
cd /root/openclaw-acp
npm install
```

#### 7. Проверка config.json

**ВАЖНО:** Файл `config.json` должен быть на сервере!

Если его нет - скопируй с локального компьютера через FileZilla.

#### 8. Запуск через PM2

```bash
cd /root/openclaw-acp

# Запустить seller runtime
pm2 start "npx tsx src/seller/runtime/seller.ts" --name "youragent-seller"

# Проверить статус
pm2 status

# Посмотреть логи
pm2 logs
```

Должен показать:
```
[seller] Agent: YourAgent
[seller] Available offerings: 3
[socket] Connected to ACP
[socket] Joined ACP room
```

#### 9. Настройка автозапуска

```bash
# Сохранить текущую конфигурацию PM2
pm2 save

# Создать startup script
pm2 startup

# ВЫПОЛНИ команду которую покажет pm2 startup
# Обычно это что-то типа:
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root
```

Теперь seller runtime будет автоматически запускаться при перезагрузке сервера!

#### 10. Проверка на aGDP.io

Открой: https://agdp.io/agent/ТВОЙ_ID

Проверь:
- ✅ Offerings видны в "Agent Skills"
- ✅ Seller runtime подключен
- 🎯 Жди первые jobs!

---

## Тестирование и мониторинг

### Как протестировать агента?

#### Вариант 1: Через Butler на Virtuals

1. Открой app.virtuals.io
2. Найди Butler (AI помощник)
3. Скажи: "Hire [YourAgent] to [do task]"
4. Butler создаст job
5. Проверь логи seller runtime

#### Вариант 2: Через другого агента

Если есть доступ к другому агенту:
1. Используй команду browse: `acp browse "нужна услуга"`
2. Найди своего агента
3. Создай job: `acp job create <wallet> <offering> --requirements '{...}'`

#### Вариант 3: Подожди реальных заказов

После регистрации offerings:
- Они видны в ACP Marketplace
- Другие агенты могут их найти
- Подожди 1-3 дня для первых заказов

### Мониторинг на VPS:

```bash
# Статус процессов
pm2 status

# Логи в реальном времени
pm2 logs youragent-seller

# Последние 100 строк логов
pm2 logs youragent-seller --lines 100

# Перезапуск
pm2 restart youragent-seller

# Остановка
pm2 stop youragent-seller
```

### Мониторинг на aGDP.io:

https://agdp.io/agent/ТВОЙ_ID

Проверяй:
- **Success Rate** - % успешных jobs
- **Jobs Completed** - количество выполненных заданий
- **Revenue** - заработанные деньги
- **Rating** - рейтинг от клиентов

### Как выглядит успешный job в логах:

```
[socket] onNewTask jobId=123 phase=0
[seller] New task jobId=123 phase=REQUEST
[seller] Executing offering "your_offering" for job 123...
[Your Service] Starting...
[Your Service] Requirements: {...}
[Your Service] Completed successfully
[sellerApi] deliverJob jobId=123
✅ Job delivered successfully
```

---

## Troubleshooting

### Проблема 1: "Offerings не появляются на aGDP.io"

**Причины:**
- Seller runtime не запущен
- Offerings не зарегистрированы через `sell create`
- Недостаточно времени (нужно 5-10 минут)

**Решение:**
```cmd
# Проверить что offerings зарегистрированы
npx tsx bin/acp.ts sell list

# Должно показать offerings со статусом "Listed"
```

### Проблема 2: "Job застревает в PENDING"

**Причины:**
- Seller runtime не работает
- Seller runtime не подключен к ACP
- Ошибка в handler

**Решение:**
```bash
# Проверить логи seller runtime
pm2 logs youragent-seller

# Должно быть:
[socket] Connected to ACP ✅
[socket] Joined ACP room ✅
```

### Проблема 3: "Error: tokenAddress is required"

**Причина:**
Handler ищет `tokenAddress`, но ACP отправляет `token_address`

**Решение:**
```typescript
// Поддерживай оба варианта
const tokenAddress = requirements.tokenAddress || requirements.token_address;
```

### Проблема 4: "Error: deliverable should not be empty"

**Причина:**
Handler не возвращает результат или возвращает `undefined`

**Решение:**
```typescript
export async function executeJob(requirements: any) {
  const result = { /* данные */ };
  
  // ОБЯЗАТЕЛЬНО return!
  return result;  // ← Не забудь!
}
```

### Проблема 5: "ERR_UNSUPPORTED_ESM_URL_SCHEME" на Windows

**Причина:**
Баг в openclaw-acp - неправильный импорт handlers на Windows

**Решение:**

В файле `src/seller/runtime/offerings.ts` замени:

```typescript
// ДО:
const handlers = (await import(handlersPath)) as OfferingHandlers;

// ПОСЛЕ:
import { pathToFileURL } from "url";
const handlersURL = pathToFileURL(handlersPath).href;
const handlers = (await import(handlersURL)) as OfferingHandlers;
```

И добавь импорт:
```typescript
import { fileURLToPath, pathToFileURL } from "url";
```

### Проблема 6: "Seller runtime падает"

**Решение на VPS через PM2:**

PM2 автоматически перезапускает при падении!

```bash
# Посмотреть почему упал
pm2 logs youragent-seller --lines 50

# Перезапустить
pm2 restart youragent-seller
```

### Проблема 7: "Job name must start with a lowercase letter"

**Причина:**
В `offering.json` name содержит заглавные буквы или пробелы

**Решение:**
```json
// ❌ НЕПРАВИЛЬНО
"name": "Token Analysis Report"

// ✅ ПРАВИЛЬНО  
"name": "token_analysis_report"
```

### Проблема 8: "Multiple agents showing in setup"

**Причина:**
Залогинен через другой кошелек, не тот которым создавал агента

**Решение:**
1. На app.virtuals.io отключи текущий кошелек
2. Подключи правильный MetaMask кошелек
3. Перезапусти `npm run setup`

---

## Чеклист

### ✅ Перед началом:

- [ ] Node.js v18+ установлен (`node --version`)
- [ ] npm установлен (`npm --version`)
- [ ] MetaMask кошелек с ETH на Base (~$5-10)
- [ ] Аккаунт на app.virtuals.io
- [ ] Идея агента и список услуг (3-5 offerings)

### ✅ Создание агента:

- [ ] Агент создан на app.virtuals.io
- [ ] Токен запущен (опционально)
- [ ] API ключ получен (формат: `acp-xxxxx`)
- [ ] Agent wallet адрес известен

### ✅ Настройка проекта:

- [ ] Создана папка проекта
- [ ] Клонирован openclaw-acp в `openclaw-acp/`
- [ ] Зависимости установлены (`npm install`)
- [ ] Запущен setup (`npm run setup`)
- [ ] config.json создан и содержит API ключ

### ✅ Создание offerings:

- [ ] Offering 1: `sell init` → заполнен → `sell create` → Listed ✅
- [ ] Offering 2: `sell init` → заполнен → `sell create` → Listed ✅
- [ ] Offering 3: `sell init` → заполнен → `sell create` → Listed ✅
- [ ] Проверка: `sell list` показывает все offerings

### ✅ Запуск seller runtime:

- [ ] Запущен локально для теста
- [ ] Видно "Connected to ACP" ✅
- [ ] Видно "Joined ACP room" ✅
- [ ] Offerings загружены (3 штуки)

### ✅ Проверка на aGDP.io:

- [ ] Offerings появились в "Agent Skills" (подожди 5-10 минут)
- [ ] Agent Status показывает активность
- [ ] Можно создать тестовый job через Butler

### ✅ Деплой на VPS:

- [ ] VPS сервер куплен и настроен
- [ ] Node.js установлен на VPS
- [ ] PM2 установлен
- [ ] Проект загружен на VPS
- [ ] config.json скопирован на VPS
- [ ] Зависимости установлены (`npm install`)
- [ ] Seller runtime запущен через PM2
- [ ] Автозапуск настроен (`pm2 startup`)
- [ ] Логи показывают "Connected to ACP"

### ✅ Работа агента:

- [ ] Offerings видны на aGDP.io
- [ ] Seller runtime работает 24/7
- [ ] First job получен и обработан ✅
- [ ] Revenue начал расти 💰

---

## Быстрый старт (TL;DR)

### На локальном компьютере:

```bash
# 1. Создать папку проекта
mkdir MyAgent && cd MyAgent

# 2. Скачать и распаковать openclaw-acp
# https://github.com/Virtual-Protocol/openclaw-acp

# 3. Установить зависимости
cd openclaw-acp
npm install

# 4. Настроить ACP
npm run setup
# Следуй инструкциям мастера

# 5. Создать offering
npx tsx bin/acp.ts sell init my_service
# Отредактируй offering.json и handlers.ts

# 6. Зарегистрировать
npx tsx bin/acp.ts sell create my_service

# 7. Запустить seller runtime
npx tsx src/seller/runtime/seller.ts
# Оставь работать!
```

### На VPS:

```bash
# 1. Установить Node.js и PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs
npm install -g pm2

# 2. Загрузить проект
# (через FileZilla или git clone)

# 3. Установить зависимости
cd openclaw-acp
npm install

# 4. Запустить через PM2
pm2 start "npx tsx src/seller/runtime/seller.ts" --name "myagent-seller"
pm2 save
pm2 startup
# Выполни команду которую покажет pm2 startup
```

---

## Шаблон для новых проектов

### 1. offering.json шаблон:

```json
{
  "name": "service_name",
  "description": "What this service does",
  "jobFee": 1.0,
  "jobFeeType": "fixed",
  "requiredFunds": false,
  "requirements": {
    "input_param": {
      "type": "string",
      "description": "Input parameter",
      "required": true
    }
  }
}
```

### 2. handlers.ts шаблон:

```typescript
export async function executeJob(requirements: any) {
  // Support both naming conventions
  const inputParam = requirements.inputParam || requirements.input_param;
  
  console.log('[Service] Starting...');
  console.log('[Service] Input:', inputParam);
  
  try {
    // YOUR LOGIC HERE
    const result = {
      success: true,
      data: "your data",
      timestamp: Date.now()
    };
    
    console.log('[Service] Completed');
    return result;  // MUST return!
    
  } catch (error) {
    console.error('[Service] Error:', error);
    throw error;
  }
}

export function validateRequirements(requirements: any): boolean {
  const inputParam = requirements.inputParam || requirements.input_param;
  
  if (!inputParam) {
    throw new Error('inputParam is required');
  }
  
  return true;
}
```

---

## Типичные ошибки (и как их избежать)

### ❌ Ошибка 1: Name с заглавными буквами

```json
// НЕПРАВИЛЬНО
"name": "Token Analysis"

// ПРАВИЛЬНО
"name": "token_analysis"
```

### ❌ Ошибка 2: Handler не возвращает результат

```typescript
// НЕПРАВИЛЬНО
export async function executeJob(requirements: any) {
  const result = { data: "..." };
  // Забыли return!
}

// ПРАВИЛЬНО
export async function executeJob(requirements: any) {
  const result = { data: "..." };
  return result;  // ✅
}
```

### ❌ Ошибка 3: Не поддерживается snake_case в requirements

```typescript
// НЕПРАВИЛЬНО
const param = requirements.myParam;  // Если придет my_param - будет undefined!

// ПРАВИЛЬНО
const param = requirements.myParam || requirements.my_param;
```

### ❌ Ошибка 4: Забыли поле в offering.json

```json
// НЕПРАВИЛЬНО (не хватает requiredFunds)
{
  "name": "service",
  "jobFee": 1.0,
  "jobFeeType": "fixed"
}

// ПРАВИЛЬНО
{
  "name": "service",
  "jobFee": 1.0,
  "jobFeeType": "fixed",
  "requiredFunds": false  // ✅ Обязательное поле!
}
```

### ❌ Ошибка 5: Seller runtime не на том компьютере

```
❌ Локальный компьютер выключен → runtime не работает → jobs теряются

✅ VPS сервер работает 24/7 → все jobs обрабатываются
```

---

## Советы и best practices

### 1. Начни с простого

**Первый агент:**
- 2-3 простых offerings
- Простая логика (можно mock данные)
- Цель: разобраться как работает система

**Второй агент:**
- Более сложная логика
- API интеграции
- Реальные данные

### 2. Тестируй локально перед VPS

```
1. Локальный тест (5-10 минут)
   ↓
2. Если работает → деплой на VPS
   ↓
3. Мониторинг и оптимизация
```

### 3. Логируй все

```typescript
console.log('[Service] Starting...');
console.log('[Service] Input:', JSON.stringify(requirements));
console.log('[Service] Processing...');
console.log('[Service] Result:', JSON.stringify(result));
console.log('[Service] Completed');
```

Логи помогут debugging!

### 4. Обрабатывай ошибки

```typescript
try {
  // логика
  return result;
} catch (error) {
  console.error('[Service] Error:', error);
  throw new Error(`Detailed error message: ${error.message}`);
}
```

### 5. Устанавливай адекватные цены

**Слишком дорого** → нет клиентов
**Слишком дешево** → не окупается VPS

**Рекомендации:**
- Быстрые проверки: 0.1-0.5 USDC
- Базовый анализ: 0.5-2 USDC
- Детальные отчеты: 2-10 USDC
- Сложные задачи: 10-50 USDC

### 6. Держи код простым

```
KISS (Keep It Simple, Stupid)
```

Сначала сделай чтобы работало, потом оптимизируй.

### 7. Backup config.json

**config.json содержит API ключ** - если потеряешь, придется заново делать setup!

Сохрани копию в безопасном месте.

### 8. Мониторь баланс кошелька

Agent wallet нужен ETH для gas fees на Base.

Если закончится → jobs будут падать!

Держи минимум $2-5 ETH на кошельке.

---

## Полезные команды

### ACP команды (в openclaw-acp/):

```bash
# Setup
npm run setup                    # Первичная настройка

# Agent management
npx tsx bin/acp.ts whoami        # Показать текущего агента
npx tsx bin/acp.ts agent list    # Список агентов

# Offerings
npx tsx bin/acp.ts sell init <name>      # Создать шаблон
npx tsx bin/acp.ts sell create <name>    # Зарегистрировать
npx tsx bin/acp.ts sell list             # Список offerings
npx tsx bin/acp.ts sell delete <name>    # Удалить

# Seller runtime
npx tsx src/seller/runtime/seller.ts     # Запустить (локально)
npm run seller:run                       # Запустить (через npm)

# Job management
npx tsx bin/acp.ts browse "<query>"      # Поиск агентов
npx tsx bin/acp.ts job create ...        # Создать job
npx tsx bin/acp.ts job status <id>       # Статус job
```

### PM2 команды (на VPS):

```bash
# Запуск
pm2 start "command" --name "name"

# Управление
pm2 status              # Статус всех процессов
pm2 logs                # Логи всех процессов
pm2 logs <name>         # Логи конкретного процесса
pm2 restart <name>      # Перезапуск
pm2 stop <name>         # Остановка
pm2 delete <name>       # Удаление

# Автозапуск
pm2 save                # Сохранить конфигурацию
pm2 startup             # Настроить автозапуск
pm2 resurrect           # Восстановить сохраненные процессы
```

---

## Пример полного workflow

### День 1: Создание агента

```
1. ✅ Придумал идею: "TokenGuard - проверка безопасности токенов"
2. ✅ Создал агента на app.virtuals.io
3. ✅ Запустил токен $GUARD
4. ✅ Получил API ключ
```

### День 2: Разработка offerings

```
1. ✅ Создал 3 offerings:
   - quick_check (0.25 USDC) - быстрая проверка
   - full_analysis (1 USDC) - полный анализ
   - risk_report (2 USDC) - детальный риск-отчет

2. ✅ Реализовал handlers с mock данными (для теста)
3. ✅ Протестировал локально
```

### День 3: Деплой и тестирование

```
1. ✅ Купил VPS на DigitalOcean ($6/mo)
2. ✅ Задеплоил через FileZilla
3. ✅ Запустил через PM2
4. ✅ Offerings появились на aGDP.io
5. ✅ Первый job получен и обработан!
```

### Неделя 1: Оптимизация

```
1. ✅ Добавил реальную логику вместо mock данных
2. ✅ Интегрировал API для получения данных
3. ✅ Оптимизировал скорость обработки
4. ✅ 15 jobs выполнено, заработано $12
```

### Месяц 1: Рост

```
1. ✅ Добавил 2 новых offerings
2. ✅ Улучшил качество результатов
3. ✅ Получил 5-star рейтинг
4. ✅ 200+ jobs, заработано $350
```

---

## Экономика агента

### Расходы:

- **VPS хостинг**: $5-10/месяц
- **Gas fees на Base**: ~$0.01-0.05 за транзакцию
- **API ключи** (если нужны): $0-50/месяц
- **Домен** (опционально): $12/год

**Итого: ~$10-20/месяц**

### Доход (при 10 jobs/день):

**Сценарий 1: Низкие цены (0.25-1 USDC)**
- 10 jobs × 0.5 USDC = 5 USDC/день
- **= $150/месяц**
- Прибыль: $150 - $15 = **$135/месяц**

**Сценарий 2: Средние цены (1-5 USDC)**
- 10 jobs × 2 USDC = 20 USDC/день
- **= $600/месяц**
- Прибыль: $600 - $15 = **$585/месяц**

**Сценарий 3: Высокие цены (5-20 USDC) + больше jobs**
- 30 jobs × 5 USDC = 150 USDC/день
- **= $4,500/месяц**
- Прибыль: **$4,485/месяц** 🚀

### Факторы успеха:

✅ **Качество услуг** - высокий рейтинг привлекает клиентов
✅ **Скорость** - быстрые результаты = больше заказов
✅ **Uptime** - 24/7 доступность критична
✅ **Уникальность** - уникальные услуги = меньше конкуренции
✅ **Маркетинг** - продвигай агента в Twitter, Discord

---

## Следующие шаги после первого агента

### 1. Оптимизация текущего агента

- Добавь реальную логику вместо mock данных
- Интегрируй внешние API
- Улучши качество результатов
- Оптимизируй скорость

### 2. Создание второго агента

Используй этот гайд для создания нового агента с другими услугами!

### 3. Автоматизация

- Создай скрипты для автоматического создания offerings
- Настрой CI/CD для деплоя
- Автоматизируй мониторинг

### 4. Масштабирование

- Запусти несколько агентов
- Каждый агент = специализация
- Перекрестная продажа услуг между агентами

---

## Полезные ссылки

### Документация:

- Virtuals Protocol Whitepaper: https://whitepaper.virtuals.io
- ACP Documentation: https://whitepaper.virtuals.io/acp-product-resources
- OpenClaw Docs: https://docs.openclaw.ai
- Base Network: https://base.org

### Инструменты:

- DEXScreener API: https://docs.dexscreener.com/api/reference
- Base RPC: https://docs.base.org/docs/network-information
- PM2 Docs: https://pm2.keymetrics.io/docs

### Сообщества:

- Virtuals Discord: (найди на virtuals.io)
- Virtuals Twitter: https://twitter.com/virtuals_io
- aGDP.io: https://agdp.io

---

## Заключение

Создание AI агента на Virtuals Protocol - это:

✅ **Технически достижимо** - Node.js + TypeScript
✅ **Экономически выгодно** - $100-1000+/месяц с одного агента
✅ **Масштабируемо** - можно запустить много агентов
✅ **Автономно** - агент работает 24/7 без участия

### Путь к успеху:

```
1. Изучи этот гайд
2. Создай первого агента (простого)
3. Задеплой на VPS
4. Получи первые jobs
5. Оптимизируй и улучшай
6. Создай второго агента (сложнее)
7. Масштабируй
8. Profit! 💰
```

---

## Инструкция для AI ассистента (Cursor)

Если ты AI ассистент который читает этот документ:

### Когда пользователь просит создать агента:

1. **Прочитай этот MASTER_GUIDE.md** полностью
2. **Следуй шагам** из раздела "Чеклист"
3. **Используй шаблоны** из раздела "Шаблон для новых проектов"
4. **Помни про типичные ошибки** из Troubleshooting
5. **Будь терпелив** - процесс может занять время

### Ключевые моменты:

⚠️ **Name в offering.json** - ОБЯЗАТЕЛЬНО lowercase с подчеркиваниями
⚠️ **Handler ДОЛЖЕН возвращать результат** через `return`
⚠️ **Requirements** - поддерживай и snake_case и camelCase
⚠️ **Windows paths** - используй `pathToFileURL()` для импортов
⚠️ **config.json** - критически важен, должен быть на сервере

### Процесс:

```
1. Клонировать openclaw-acp
2. npm install
3. npm run setup (интерактивный мастер)
4. Для каждого offering:
   - sell init <name>
   - Отредактировать offering.json
   - Реализовать handlers.ts
   - sell create <name>
5. Запустить seller runtime
6. Деплой на VPS через PM2
```

---

**Версия:** 1.0.0
**Дата:** 2026-02-17
**Автор:** ClawSignal Team
**Статус:** Production Ready ✅

---

**Удачи в создании агентов!** 🚀🦞

