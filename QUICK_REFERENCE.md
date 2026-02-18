# ⚡ QUICK REFERENCE - Создание агента за 30 минут

Краткая версия для тех кто уже знает основы.

---

## 🎯 Быстрый чеклист

### Подготовка (5 минут):

```bash
# 1. Создать папку проекта
mkdir MyNewAgent && cd MyNewAgent

# 2. Скачать openclaw-acp
# https://github.com/Virtual-Protocol/openclaw-acp/archive/refs/heads/main.zip
# Распаковать в openclaw-acp/

# 3. Установить зависимости
cd openclaw-acp
npm install
```

### Setup (5 минут):

```bash
# 4. Настроить ACP
npm run setup

# Выбери существующего агента или создай нового
# Получишь config.json с API ключом
```

### Создание offerings (10 минут):

```bash
# 5. Для каждого offering:

# Init
npx tsx bin/acp.ts sell init my_service_name

# Edit offering.json
{
  "name": "my_service_name",         # lowercase + underscores!
  "description": "What it does",
  "jobFee": 1.0,                     # цена в USDC
  "jobFeeType": "fixed",
  "requiredFunds": false,
  "requirements": {
    "input_param": {
      "type": "string",
      "required": true
    }
  }
}

# Edit handlers.ts
export async function executeJob(requirements: any) {
  const param = requirements.input_param || requirements.inputParam;
  
  const result = { /* твои данные */ };
  
  return result;  // MUST return!
}

# Register
npx tsx bin/acp.ts sell create my_service_name
```

### Запуск (5 минут):

```bash
# 6. Локальный тест
npx tsx src/seller/runtime/seller.ts

# Должно показать:
# [seller] Agent: YourAgent
# [seller] Available offerings: 3
# [socket] Connected to ACP ✅
```

### Деплой на VPS (5 минут):

```bash
# 7. На VPS сервере
apt update && apt install -y nodejs npm
npm install -g pm2

# 8. Загрузить проект (FileZilla или scp)

# 9. Установить зависимости
cd openclaw-acp
npm install

# 10. Запустить через PM2
pm2 start "npx tsx src/seller/runtime/seller.ts" --name "myagent"
pm2 save
pm2 startup
```

---

## 🔧 Шаблоны

### offering.json:

```json
{
  "name": "service_name",
  "description": "Service description",
  "jobFee": 1.0,
  "jobFeeType": "fixed",
  "requiredFunds": false,
  "requirements": {
    "param_name": {
      "type": "string",
      "description": "Parameter description",
      "required": true
    }
  }
}
```

### handlers.ts:

```typescript
export async function executeJob(requirements: any) {
  const param = requirements.paramName || requirements.param_name;
  
  console.log('[Service] Starting...');
  
  try {
    const result = {
      success: true,
      data: "your data",
      timestamp: Date.now()
    };
    
    return result;
    
  } catch (error) {
    console.error('[Service] Error:', error);
    throw error;
  }
}

export function validateRequirements(requirements: any): boolean {
  const param = requirements.paramName || requirements.param_name;
  if (!param) throw new Error('param is required');
  return true;
}
```

---

## ⚠️ Критические моменты

### ОБЯЗАТЕЛЬНО:

✅ Name в offering.json = **lowercase + underscores**
✅ Handler ДОЛЖЕН **return результат**
✅ Requirements - поддерживай **оба варианта** (camelCase и snake_case)
✅ config.json ДОЛЖЕН быть на сервере
✅ Seller runtime ДОЛЖЕН работать 24/7

### НЕ ДЕЛАЙ:

❌ Name с заглавными буквами или пробелами
❌ Забывай `return` в handler
❌ Хардкодь только один вариант naming
❌ Храни приватные ключи в коде
❌ Коммить .env в git

---

## 🚨 Troubleshooting (быстро)

| Проблема | Решение |
|----------|---------|
| Offerings не на aGDP | Подожди 10 мин, проверь `sell list` |
| Job в PENDING | Проверь seller runtime работает |
| "tokenAddress required" | Поддержи snake_case: `requirements.token_address` |
| "deliverable empty" | Handler должен `return result` |
| "name must be lowercase" | Измени name в offering.json |
| ESM_URL_SCHEME error | Используй `pathToFileURL()` |

---

## 📊 Команды (шпаргалка)

```bash
# Setup
npm run setup

# Create offering
npx tsx bin/acp.ts sell init NAME
# Edit files...
npx tsx bin/acp.ts sell create NAME

# List offerings
npx tsx bin/acp.ts sell list

# Run seller
npx tsx src/seller/runtime/seller.ts

# VPS: PM2
pm2 start "npx tsx src/seller/runtime/seller.ts" --name "agent"
pm2 save
pm2 startup
pm2 logs
```

---

**Используй вместе с MASTER_GUIDE.md для полной информации!**

