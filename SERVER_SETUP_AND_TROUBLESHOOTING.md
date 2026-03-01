# 🚀 AgentPulse - Настройка Сервера и Решение Проблем

## 📋 ИНФОРМАЦИЯ О СЕРВЕРЕ

**VPS:** VDSina  
**IP:** <YOUR_SERVER_IP>  
**OS:** Ubuntu 24.04  
**Node.js:** v20.20.0  
**PM2:** v6.0.14  

**Доступ:**
```bash
ssh root@<YOUR_SERVER_IP>
```

---

## 🎯 ЧТО СДЕЛАНО

### 1. Первоначальная настройка сервера
```bash
# Обновление системы
apt update && apt upgrade -y

# Установка Node.js 20.x (ВАЖНО: версия 20+!)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Проверка версии
node -v  # Должно быть v20.x.x или выше

# Установка PM2
npm install -g pm2

# Установка Git
apt install git -y
```

### 2. Деплой проекта
```bash
# Клонирование репозитория
cd /root
git clone https://github.com/AndreyP55/AgentPulse.git

# Переход в директорию проекта
cd /root/AgentPulse/openclaw-acp

# Установка зависимостей
npm install

# Копирование config.json с компьютера (с актуальным токеном)
# Выполняется с ЛОКАЛЬНОГО компьютера:
# scp c:\Users\Pc\Desktop\AgentPulse\openclaw-acp\config.json root@<YOUR_SERVER_IP>:/root/AgentPulse/openclaw-acp/
```

### 3. Запуск через PM2
```bash
cd /root/AgentPulse/openclaw-acp

# Запуск агента
pm2 start "npx tsx src/seller/runtime/seller.ts" --name agentpulse-seller

# Настройка автозапуска при перезагрузке
pm2 startup
pm2 save

# Проверка статуса
pm2 status
```

---

## ⚠️ ПРОБЛЕМЫ И РЕШЕНИЯ

### Проблема 1: ReferenceError: File is not defined

**Симптомы:**
```
ReferenceError: File is not defined
at Object.<anonymous> (/root/AgentPulse/openclaw-acp/node_modules/undici/lib/web/webidl/index.js:534:48)
```

**Причина:**  
Пакет `undici` требует Node.js >= 20.18.1, а на сервере была версия 18.x

**Решение:**
```bash
# 1. Обновить Node.js до версии 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# 2. Проверить версию
node -v  # Должно быть v20.x.x

# 3. Переустановить зависимости
cd /root/AgentPulse/openclaw-acp
rm -rf node_modules package-lock.json
npm install

# 4. Пересоздать PM2 процесс (важно!)
pm2 delete agentpulse-seller
pm2 start "npx tsx src/seller/runtime/seller.ts" --name agentpulse-seller
pm2 save

# 5. Очистить старые логи и проверить
pm2 flush
pm2 logs agentpulse-seller --lines 30
```

### Проблема 2: Агент не запускается после перезагрузки

**Решение:**
```bash
# Настроить автозапуск PM2
pm2 startup
# Выполнить команду, которую PM2 выведет

# Сохранить текущий список процессов
pm2 save
```

### Проблема 3: Старый код на сервере после git push

**Решение:**
```bash
cd /root/AgentPulse

# Принудительно обновить до последней версии
git fetch origin
git reset --hard origin/main

# Переустановить зависимости (если были изменения в package.json)
cd openclaw-acp
npm install

# Перезапустить агента
pm2 restart agentpulse-seller
```

### Проблема 4: Токен устарел (агент не подключается к ACP)

**Симптомы:**
```
[socket] Unauthorized
[seller] Failed to connect to ACP
```

**Решение:**
```bash
# 1. На ЛОКАЛЬНОМ компьютере сгенерировать новый токен
cd c:\Users\Pc\Desktop\AgentPulse\openclaw-acp
npm run setup

# 2. Скопировать config.json на сервер
scp c:\Users\Pc\Desktop\AgentPulse\openclaw-acp\config.json root@<YOUR_SERVER_IP>:/root/AgentPulse/openclaw-acp/

# 3. На сервере перезапустить агента
pm2 restart agentpulse-seller
```

**⚠️ ВАЖНО:** Каждый `npm run setup` создаёт НОВЫЙ токен и убивает старый!

### Проблема 5: PM2 показывает старые ошибки в логах

**Решение:**
```bash
# Очистить все логи
pm2 flush

# Перезапустить агента
pm2 restart agentpulse-seller

# Проверить свежие логи
pm2 logs agentpulse-seller --lines 30
```

### Проблема 6: Агент в статусе "stopped" или "errored"

**Решение:**
```bash
# Проверить статус
pm2 status

# Если stopped - запустить
pm2 start agentpulse-seller

# Если errored - посмотреть логи
pm2 logs agentpulse-seller --lines 50

# Если не помогает - пересоздать процесс
pm2 delete agentpulse-seller
cd /root/AgentPulse/openclaw-acp
pm2 start "npx tsx src/seller/runtime/seller.ts" --name agentpulse-seller
pm2 save
```

---

## 🔧 ПОЛЕЗНЫЕ КОМАНДЫ

### Проверка статуса
```bash
# Статус PM2 процессов
pm2 status

# Подробная информация
pm2 show agentpulse-seller

# Использование ресурсов
pm2 monit
```

### Работа с логами
```bash
# Последние 30 строк логов
pm2 logs agentpulse-seller --lines 30

# Логи в реальном времени
pm2 logs agentpulse-seller

# Очистить все логи
pm2 flush

# Только ошибки
pm2 logs agentpulse-seller --err

# Только вывод
pm2 logs agentpulse-seller --out
```

### Управление процессом
```bash
# Перезапуск
pm2 restart agentpulse-seller

# Остановка
pm2 stop agentpulse-seller

# Запуск
pm2 start agentpulse-seller

# Удаление процесса
pm2 delete agentpulse-seller

# Перезагрузка всех процессов
pm2 restart all
```

### Обновление кода
```bash
# Полное обновление
cd /root/AgentPulse
git pull
cd openclaw-acp
npm install
pm2 restart agentpulse-seller

# Принудительное обновление (если git pull не работает)
git fetch origin
git reset --hard origin/main
npm install
pm2 restart agentpulse-seller
```

---

## 🔍 ДИАГНОСТИКА ПРОБЛЕМ

### Проверка подключения к ACP
```bash
pm2 logs agentpulse-seller --lines 50 | grep "Connected to ACP"
```
Должно быть: `[socket] Connected to ACP`

### Проверка загрузки offerings
```bash
pm2 logs agentpulse-seller --lines 50 | grep "Available offerings"
```
Должно быть: `[seller] Available offerings: health_check, reputation_report, shared`

### Проверка выполнения джоб
```bash
pm2 logs agentpulse-seller --lines 100 | grep "delivered"
```
Должны быть строки: `[seller] Job XXXXXX — delivered.`

### Проверка ошибок
```bash
pm2 logs agentpulse-seller --err --lines 50
```
Должно быть пусто или только старые ошибки (до последнего restart)

---

## 📊 МОНИТОРИНГ

### Проверка здоровья агента
```bash
# Статус процесса
pm2 status

# Должно быть:
# status: online ✅
# restarts: низкое число (< 10)
# uptime: растёт со временем
```

### Проверка активности
```bash
# Последние 100 строк логов
pm2 logs agentpulse-seller --lines 100

# Ищи:
# - "New task" - новые заказы
# - "delivered" - успешно выполненные джобы
# - "Connected to ACP" - подключение активно
```

### Проверка через Butler
1. Зайди на https://butler.virtuals.io
2. Найди агент AgentPulse (0xF50446A22761B9054d50FC82BBd2a400a62d739C)
3. Создай тестовый заказ
4. Проверь выполнение в логах сервера

---

## 🔄 ОБНОВЛЕНИЕ ПРОЕКТА

### Когда нужно обновлять код на сервере:

1. **После изменений локально:**
```bash
# На компьютере
cd c:\Users\Pc\Desktop\AgentPulse
git add .
git commit -m "Описание изменений"
git push

# На сервере
ssh root@<YOUR_SERVER_IP>
cd /root/AgentPulse
git pull
cd openclaw-acp
pm2 restart agentpulse-seller
```

2. **После обновления токена:**
```bash
# На компьютере
cd c:\Users\Pc\Desktop\AgentPulse\openclaw-acp
npm run setup

# Скопировать config.json на сервер
scp c:\Users\Pc\Desktop\AgentPulse\openclaw-acp\config.json root@<YOUR_SERVER_IP>:/root/AgentPulse/openclaw-acp/

# На сервере
pm2 restart agentpulse-seller
```

3. **После изменения зависимостей:**
```bash
# На сервере
cd /root/AgentPulse/openclaw-acp
npm install
pm2 restart agentpulse-seller
```

---

## 🆘 КРИТИЧЕСКИЕ ПРОБЛЕМЫ

### Агент постоянно перезапускается (restarts растёт)

**Диагностика:**
```bash
pm2 logs agentpulse-seller --err --lines 100
```

**Возможные причины:**
1. Ошибка в коде - проверь логи ошибок
2. Нет config.json или неверный токен
3. Проблемы с зависимостями - переустанови `npm install`
4. Нехватка памяти - проверь `free -h`

**Решение:**
```bash
# Остановить агента
pm2 stop agentpulse-seller

# Запустить вручную для отладки
cd /root/AgentPulse/openclaw-acp
npx tsx src/seller/runtime/seller.ts

# Если ошибка видна - исправить и запустить через PM2
pm2 start agentpulse-seller
```

### Сервер перезагрузился - агент не запустился

**Проверка:**
```bash
pm2 status
```

**Если процесса нет:**
```bash
# Восстановить из сохранённого списка
pm2 resurrect

# Если не помогло - запустить заново
cd /root/AgentPulse/openclaw-acp
pm2 start "npx tsx src/seller/runtime/seller.ts" --name agentpulse-seller
pm2 save
```

### Нет подключения к ACP

**Симптомы:**
```
[socket] Connection failed
[socket] Unauthorized
```

**Решение:**
1. Проверить токен в config.json
2. Сгенерировать новый токен локально: `npm run setup`
3. Скопировать config.json на сервер
4. Перезапустить: `pm2 restart agentpulse-seller`

---

## 📈 СТАТИСТИКА И МЕТРИКИ

### Проверка заработка
```bash
# Поиск успешных джоб в логах
pm2 logs agentpulse-seller --lines 1000 | grep "delivered" | wc -l
```

### Проверка ошибок выполнения
```bash
# Поиск failed джоб
pm2 logs agentpulse-seller --lines 1000 | grep "failed"
```

### Мониторинг в реальном времени
```bash
# Открыть логи в реальном времени
pm2 logs agentpulse-seller

# Остановить просмотр: Ctrl+C
```

---

## 🔐 ВАЖНАЯ ИНФОРМАЦИЯ

### Кошельки
- **Агент:** 0xF50446A22761B9054d50FC82BBd2a400a62d739C
- **Личный:** 0xdb6724f4feAf93079601c3E6aEDfE9dB5d6E0c52

### GitHub
- **Репозиторий:** https://github.com/AndreyP55/AgentPulse
- **Статус:** Public

### Offerings
- **health_check** - 0.25 USDC (быстрая проверка здоровья агента)
- **reputation_report** - 0.5 USDC (полный анализ репутации)

### API Endpoints (используются в коде)
- Метрики: https://acpx.virtuals.io/api/metrics/agent/{agentId}
- Лидерборд: https://api.virtuals.io/api/agdp-leaderboard-epochs/1/ranking

---

## 🛠️ СТРУКТУРА ПРОЕКТА НА СЕРВЕРЕ

```
/root/AgentPulse/
├── openclaw-acp/
│   ├── config.json              # Токен для ACP (обновляется через npm run setup)
│   ├── package.json             # Зависимости проекта
│   ├── node_modules/            # Установленные пакеты
│   └── src/
│       └── seller/
│           ├── offerings/
│           │   └── agentpulse/
│           │       ├── health_check/
│           │       │   ├── offering.json
│           │       │   └── handlers.ts
│           │       ├── reputation_report/
│           │       │   ├── offering.json
│           │       │   └── handlers.ts
│           │       └── shared/
│           │           └── agdp-client.ts
│           └── runtime/
│               └── seller.ts    # Главный файл агента
```

---

## 🚨 ИСТОРИЯ РЕШЁННЫХ ПРОБЛЕМ

### 18 февраля 2026 - Проблема с ReferenceError: File is not defined

**Что было:**
- Агент работал локально на компьютере
- На сервере падал с ошибкой `ReferenceError: File is not defined`
- Ошибка возникала в `node_modules/undici/lib/web/webidl/index.js`

**Что пробовали:**
1. ❌ Обновление кода через `git pull` - не помогло
2. ❌ Переустановка `node_modules` - не помогло
3. ❌ Перезапуск PM2 - не помогло

**Что помогло:**
1. ✅ Обнаружили, что на сервере Node.js v18.19.1
2. ✅ Пакет `undici@7.22.0` требует Node.js >= 20.18.1
3. ✅ Обновили Node.js до v20.20.0
4. ✅ Пересоздали PM2 процесс (старый процесс использовал старый Node.js)
5. ✅ Агент заработал без ошибок

**Ключевой момент:**  
После обновления Node.js нужно **ПЕРЕСОЗДАТЬ** PM2 процесс, а не просто перезапустить! PM2 кеширует путь к Node.js при первом запуске.

---

## 📝 ЧЕКЛИСТ ПОСЛЕ ПЕРЕЗАГРУЗКИ СЕРВЕРА

```bash
# 1. Подключиться к серверу
ssh root@<YOUR_SERVER_IP>

# 2. Проверить статус PM2
pm2 status
# Должно быть: status = online

# 3. Проверить логи
pm2 logs agentpulse-seller --lines 30
# Должно быть:
# - [seller] Seller runtime is running
# - [socket] Connected to ACP
# - НЕТ ошибок в error.log

# 4. Проверить версию Node.js
node -v
# Должно быть: v20.x.x или выше

# 5. Если что-то не так - восстановить
pm2 resurrect
pm2 restart agentpulse-seller
```

---

## 🎯 СЛЕДУЮЩИЕ ЗАДАЧИ

### Запланировано:
- ⏳ Изменить цены offerings
- ⏳ Добавить новые offerings
- ⏳ Реализовать buyer функционал

### Для изменения цен:
1. Отредактировать `offering.json` в папках offerings
2. Закоммитить и запушить на GitHub
3. Обновить код на сервере: `git pull`
4. Перезапустить: `pm2 restart agentpulse-seller`

---

## 🆘 ЭКСТРЕННАЯ ПОМОЩЬ

### Если агент совсем не работает:

```bash
# 1. Остановить PM2
pm2 stop agentpulse-seller

# 2. Запустить вручную для отладки
cd /root/AgentPulse/openclaw-acp
npx tsx src/seller/runtime/seller.ts

# 3. Смотреть вывод - там будет видна ошибка

# 4. После исправления - запустить через PM2
pm2 start "npx tsx src/seller/runtime/seller.ts" --name agentpulse-seller
pm2 save
```

### Если нужно полностью переустановить:

```bash
# 1. Удалить старую установку
pm2 delete agentpulse-seller
cd /root
rm -rf AgentPulse

# 2. Установить заново
git clone https://github.com/AndreyP55/AgentPulse.git
cd AgentPulse/openclaw-acp
npm install

# 3. Скопировать config.json с компьютера
# (выполнить с локального компьютера)
# scp c:\Users\Pc\Desktop\AgentPulse\openclaw-acp\config.json root@<YOUR_SERVER_IP>:/root/AgentPulse/openclaw-acp/

# 4. Запустить
pm2 start "npx tsx src/seller/runtime/seller.ts" --name agentpulse-seller
pm2 startup
pm2 save
```

---

## ✅ ПРИЗНАКИ ЗДОРОВОГО АГЕНТА

### В логах должно быть:
```
[seller] Agent: AgentPulse (dir: agentpulse)
[seller] Available offerings: health_check, reputation_report, shared
[seller] Seller runtime is running. Waiting for jobs...
[socket] Connected to ACP
[socket] Joined ACP room
```

### При получении заказа:
```
[socket] onNewTask  jobId=XXXXXXX  phase=0
[seller] New task  jobId=XXXXXXX  phase=REQUEST
[sellerApi] acceptOrRejectJob  accept=true
[seller] Executing offering "health_check"...
[seller] Job XXXXXXX — delivered.
```

### PM2 статус:
- **status:** online ✅
- **restarts:** < 5 (низкое число)
- **uptime:** растёт со временем
- **memory:** 15-30mb (нормально)
- **cpu:** 0-5% (в покое)

---

## 🎓 ПОЛЕЗНЫЕ ССЫЛКИ

- **Butler (создание заказов):** https://butler.virtuals.io
- **aGDP (статистика агентов):** https://agdp.io
- **Ваш агент на aGDP:** https://agdp.io/agent/0xF50446A22761B9054d50FC82BBd2a400a62d739C
- **GitHub репозиторий:** https://github.com/AndreyP55/AgentPulse
- **PM2 документация:** https://pm2.keymetrics.io/docs/usage/quick-start/

---

## 💡 СОВЕТЫ

1. **Регулярно проверяй логи** - раз в день заходи и смотри `pm2 logs`
2. **Следи за статусом** - агент должен быть `online` всегда
3. **Обновляй токен** - если агент не подключается к ACP
4. **Делай бэкапы config.json** - храни копию токена в безопасном месте
5. **Тестируй после изменений** - всегда создавай тестовый заказ после обновления
6. **Не удаляй node_modules без причины** - только если есть проблемы с зависимостями
7. **Используй `pm2 save`** - после любых изменений в PM2 процессах

---

## 🎉 ТЕКУЩИЙ СТАТУС

✅ **Сервер настроен и работает**  
✅ **Агент подключён к ACP**  
✅ **Offerings активны:**
- health_check - 0.25 USDC
- reputation_report - 0.5 USDC

✅ **Автозапуск настроен**  
✅ **Джобы выполняются успешно**  
✅ **Код актуальный на GitHub и сервере**  

**Можешь закрыть Cursor - агент работает автономно 24/7!**

---

*Последнее обновление: 18 февраля 2026*  
*Версия агента: AgentPulse v1.0*
