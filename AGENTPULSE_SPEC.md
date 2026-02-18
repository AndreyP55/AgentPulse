# 🏥 AgentPulse - Detailed Specification

**AI Agent для мониторинга здоровья других агентов в экосистеме Virtuals Protocol**

---

## 🎯 Концепция

AgentPulse - это "доктор" для AI агентов. Проверяет их здоровье, мониторит uptime, анализирует репутацию.

**Tagline:** "Keep your agents healthy, keep your revenue flowing"

---

## 💼 Offerings (3 услуги)

### 1. health_check - 0.25 USDC

**Что делает:**
Быстрая проверка текущего статуса агента (5-10 секунд)

**Input:**
```json
{
  "agent_id": 2573  // или agent_wallet
}
```

**Output:**
```json
{
  "healthScore": 85,  // 0-100
  "status": "healthy",  // healthy/warning/critical
  "checks": {
    "isOnline": true,
    "hasActiveOfferings": true,
    "recentActivity": true,
    "goodSuccessRate": true
  },
  "metrics": {
    "successRate": 95.5,
    "jobsCompleted": 127,
    "lastJobTimestamp": 1771342898761,
    "averageResponseTime": "15s"
  },
  "issues": [],
  "recommendations": [
    "Agent is healthy and performing well"
  ],
  "timestamp": 1771342898761
}
```

**Логика:**

```typescript
// 1. Fetch agent data from aGDP.io
const agentData = await axios.get(`https://agdp.io/api/agent/${agentId}`);

// 2. Calculate health score
let healthScore = 0;

// Success rate check (0-40 points)
const successRate = agentData.successRate || 0;
if (successRate >= 95) healthScore += 40;
else if (successRate >= 85) healthScore += 30;
else if (successRate >= 70) healthScore += 20;
else if (successRate >= 50) healthScore += 10;

// Activity check (0-30 points)
const lastJob = agentData.lastJobTimestamp;
const hoursSinceLastJob = (Date.now() - lastJob) / (1000 * 60 * 60);
if (hoursSinceLastJob < 1) healthScore += 30;
else if (hoursSinceLastJob < 6) healthScore += 20;
else if (hoursSinceLastJob < 24) healthScore += 10;

// Jobs completed (0-30 points)
const jobsCompleted = agentData.jobsCompleted || 0;
if (jobsCompleted > 100) healthScore += 30;
else if (jobsCompleted > 50) healthScore += 20;
else if (jobsCompleted > 10) healthScore += 10;

// 3. Determine status
let status = 'healthy';
if (healthScore < 30) status = 'critical';
else if (healthScore < 60) status = 'warning';

// 4. Generate recommendations
const recommendations = [];
if (successRate < 90) recommendations.push('Improve service quality');
if (hoursSinceLastJob > 24) recommendations.push('Agent may be offline');
if (jobsCompleted < 10) recommendations.push('New agent, build reputation');

return {
  deliverable: {
    healthScore,
    status,
    metrics: agentData,
    recommendations
  }
};
```

**API Calls:**
- aGDP.io API (если есть) или web scraping
- Просто HTTP GET запрос

---

### 2. uptime_monitor_24h - 0.5 USDC

**Что делает:**
Мониторинг uptime агента в течение 24 часов

**Input:**
```json
{
  "agent_id": 2573,
  "alert_webhook": "https://...", // опционально
  "check_interval": 5 // минуты, default 5
}
```

**Output (через 24h):**
```json
{
  "agentId": 2573,
  "monitoringPeriod": "24h",
  "uptime": 98.5,  // %
  "totalChecks": 288,  // 24h / 5min = 288 checks
  "successfulChecks": 284,
  "failedChecks": 4,
  "downtimes": [
    {
      "start": 1771340000000,
      "end": 1771341000000,
      "duration": "16 minutes",
      "reason": "Seller runtime offline"
    }
  ],
  "averageResponseTime": "12s",
  "alerts": [
    "Downtime detected at 14:35 UTC (16 minutes)"
  ],
  "timestamp": 1771342898761
}
```

**Логика:**

```typescript
// 1. Start monitoring loop
const checks = [];
const startTime = Date.now();
const interval = (requirements.check_interval || 5) * 60 * 1000; // ms

// 2. Check every N minutes for 24h
for (let i = 0; i < 288; i++) {
  const isOnline = await pingAgent(agentId);
  checks.push({
    timestamp: Date.now(),
    online: isOnline
  });
  
  // If offline, send alert
  if (!isOnline && requirements.alert_webhook) {
    await sendAlert(requirements.alert_webhook, `Agent ${agentId} offline`);
  }
  
  // Wait interval
  await sleep(interval);
}

// 3. Analyze results
const successfulChecks = checks.filter(c => c.online).length;
const uptime = (successfulChecks / checks.length) * 100;

// 4. Find downtimes
const downtimes = detectDowntimes(checks);

return {
  deliverable: {
    uptime,
    totalChecks: checks.length,
    successfulChecks,
    downtimes,
    alerts: downtimes.map(d => `Downtime: ${d.duration}`)
  }
};
```

**Технологии:**
- Simple loop с setTimeout
- JSON file storage для checks
- Webhook для alerts (опционально)

**ВАЖНО:** Это длительный job (24h), нужно правильно обрабатывать!

---

### 3. reputation_report - 1.0 USDC

**Что делает:**
Детальный анализ репутации агента

**Input:**
```json
{
  "agent_id": 2573,
  "period": "30d"  // 7d, 30d, 90d
}
```

**Output:**
```json
{
  "agentId": 2573,
  "agentName": "ClawSignal",
  "period": "30d",
  "overallScore": 87,  // 0-100
  "metrics": {
    "successRate": 95.5,
    "jobsCompleted": 127,
    "uniqueBuyers": 45,
    "totalRevenue": 156.75,
    "averageRating": 4.8,
    "responseTime": "15s"
  },
  "trends": {
    "jobsGrowth": "+25%",
    "revenueGrowth": "+40%",
    "ratingTrend": "stable"
  },
  "strengths": [
    "High success rate (95.5%)",
    "Fast response time",
    "Consistent quality"
  ],
  "weaknesses": [
    "Limited offering variety (3 services)",
    "No subscription model"
  ],
  "recommendations": [
    "Add 2-3 new offerings to increase touchpoints",
    "Consider monthly subscription for regulars",
    "Improve marketing presence"
  ],
  "competitivePosition": {
    "rank": 15,  // из всех агентов в категории
    "category": "analytics",
    "pricingVsMarket": "competitive"
  },
  "timestamp": 1771342898761
}
```

**Логика:**

```typescript
// 1. Fetch agent data
const agent = await getAgentData(agentId);
const jobs = await getAgentJobs(agentId, period);

// 2. Calculate metrics
const successRate = (jobs.filter(j => j.success).length / jobs.length) * 100;
const totalRevenue = jobs.reduce((sum, j) => sum + j.price, 0);
const uniqueBuyers = new Set(jobs.map(j => j.buyer)).size;

// 3. Calculate trends
const previousPeriod = await getAgentJobs(agentId, getPreviousPeriod(period));
const jobsGrowth = ((jobs.length - previousPeriod.length) / previousPeriod.length) * 100;

// 4. Analyze strengths/weaknesses
const strengths = [];
const weaknesses = [];
if (successRate > 90) strengths.push("High success rate");
if (agent.offerings.length < 5) weaknesses.push("Limited offerings");

// 5. Generate recommendations
const recommendations = [];
if (weaknesses.includes("Limited offerings")) {
  recommendations.push("Add more offerings");
}

// 6. Compare with market
const allAgents = await getAllAgents(agent.category);
const rank = allAgents.findIndex(a => a.id === agentId) + 1;

return {
  deliverable: {
    overallScore: calculateOverallScore(metrics),
    metrics,
    trends,
    strengths,
    weaknesses,
    recommendations,
    competitivePosition: { rank }
  }
};
```

---

## 🔧 Технические детали

### Источники данных:

**aGDP.io:**
- Agent profile page: `agdp.io/agent/{id}`
- Job history
- Success rate, ratings

**Методы получения:**

**Вариант A: Public API (если есть)**
```typescript
const agent = await axios.get(`https://agdp.io/api/agent/${id}`);
```

**Вариант B: Web Scraping (если API нет)**
```typescript
import * as cheerio from 'cheerio';
const html = await axios.get(`https://agdp.io/agent/${id}`);
const $ = cheerio.load(html.data);
const successRate = $('.success-rate').text();
```

**Вариант C: On-chain data**
```typescript
// Читать события с Base blockchain
const jobs = await getJobEventsFromChain(agentWallet);
```

### Зависимости:

```json
{
  "dependencies": {
    "axios": "^1.6.5",
    "cheerio": "^1.0.0",  // если scraping
    "ethers": "^6.10.0"   // если on-chain
  }
}
```

---

## 📊 Бизнес-модель AgentPulse

### Pricing Strategy:

**Freemium Model:**
- Basic health check: 0.25 USDC (cheap для adoption)
- 24h monitoring: 0.5 USDC (premium)
- Full reputation report: 1.0 USDC (enterprise)

**Subscription добавить позже:**
- Daily health check: 5 USDC/месяц
- Real-time monitoring: 10 USDC/месяц
- Full analytics suite: 20 USDC/месяц

### Target Customers:

**B2C (Люди):**
- Agent creators проверяют свой агент
- Investors перед наймом агента
- Troubleshooting когда агент не работает

**B2B (Агенты):**
- Agents перед наймом другого агента
- Portfolio manager агенты для monitoring
- Alert bots для real-time checks

---

## 🚀 MVP Implementation Plan

### День 1: Setup (2 часа)

1. Создать агента на Virtuals
2. Клонировать openclaw-acp
3. npm run setup
4. Настроить структуру проекта

### День 2: Development (4-6 часов)

**Offering 1: health_check (2 часа)**
```typescript
// handlers.ts
export async function executeJob(requirements: any) {
  const agentId = requirements.agent_id || requirements.agentId;
  
  // Fetch data from aGDP.io
  const data = await fetchAgentData(agentId);
  
  // Calculate score
  const healthScore = calculateHealthScore(data);
  
  return {
    deliverable: {
      healthScore,
      status: getStatus(healthScore),
      metrics: data,
      recommendations: generateRecommendations(data)
    }
  };
}
```

**Offering 2: reputation_report (2 часа)**
- Расширенная версия health_check
- Больше метрик
- Trends analysis

**Offering 3: uptime_monitor (опционально позже)**
- Сложнее - требует long-running process
- Можно добавить в Phase 2

### День 3: Testing & Deploy (2-3 часа)

1. Тестирование локально
2. Деплой на VPS
3. Мониторинг первых jobs

---

## 📝 Что дать новому AI чату:

### Файлы для чтения:

```
@MASTER_GUIDE.md              # Как создавать агента
@AI_ASSISTANT_INSTRUCTIONS.md # Критические моменты
@AGENT_IDEAS.md               # Идея AgentPulse
@AGENTPULSE_SPEC.md          # Этот файл (детали)
```

### Пример промпта:

```
Привет! Я хочу создать AI агента AgentPulse на Virtuals Protocol.

Сначала прочитай эти файлы для контекста:
1. @MASTER_GUIDE.md - общая инструкция
2. @AI_ASSISTANT_INSTRUCTIONS.md - важные детали
3. @AGENTPULSE_SPEC.md - спецификация AgentPulse

Мне нужно:
1. Создать структуру проекта
2. Реализовать 2 offerings (health_check и reputation_report)
3. Интегрировать с aGDP.io API для данных агентов
4. Настроить ACP и зарегистрировать offerings
5. Запустить и протестировать

Используй код ClawSignal как reference (в папке ClawSignalAgent/openclaw-acp/src/seller/offerings/clawsignal/)

Начнем с создания структуры проекта.
```

---

## 🔧 Technical Implementation Notes

### Fetching Agent Data:

**Попробуй эти endpoints (могут работать):**

```typescript
// Вариант 1: Direct API (проверить работает ли)
const response = await axios.get(`https://agdp.io/api/agent/${agentId}`);

// Вариант 2: Если API нет, scraping
const html = await axios.get(`https://agdp.io/agent/${agentId}`);
// Parse HTML с cheerio

// Вариант 3: ACP CLI commands
import { exec } from 'child_process';
const agentInfo = await exec(`npx tsx bin/acp.ts browse "agent ${agentId}"`);
```

### Health Score Algorithm:

```typescript
function calculateHealthScore(agentData: any): number {
  let score = 0;
  
  // Success Rate (40 points max)
  const successRate = agentData.successRate || 0;
  score += Math.min(40, (successRate / 100) * 40);
  
  // Recent Activity (30 points max)
  const hoursSinceLastJob = getHoursSinceLastJob(agentData.lastJobTimestamp);
  if (hoursSinceLastJob < 1) score += 30;
  else if (hoursSinceLastJob < 6) score += 20;
  else if (hoursSinceLastJob < 24) score += 10;
  else if (hoursSinceLastJob < 72) score += 5;
  
  // Total Jobs (30 points max)
  const jobs = agentData.jobsCompleted || 0;
  score += Math.min(30, Math.log10(jobs + 1) * 10);
  
  return Math.min(100, Math.max(0, score));
}
```

---

## 🎯 Success Criteria

### MVP Success:
- ✅ 2 offerings работают (health_check, reputation_report)
- ✅ Реальные данные с aGDP.io
- ✅ Задеплоено на VPS
- ✅ 10+ jobs выполнено успешно
- ✅ $10+ заработано

### Phase 2 Success:
- ✅ 100+ jobs/месяц
- ✅ 4.5+ star rating
- ✅ $200+ revenue/месяц
- ✅ 3 offerings total

### Long-term Success:
- ✅ 500+ jobs/месяц
- ✅ 5-star rating
- ✅ $1,000+ revenue/месяц
- ✅ Subscription model добавлен

---

## 💡 Competitive Advantages

**Почему AgentPulse победит:**

1. **First Mover** - пока никто не делает health monitoring
2. **Essential Service** - всем нужно знать статус агента
3. **Low Friction** - дешевые цены, быстрые результаты
4. **Network Effects** - чем больше агентов используют, тем больше данных
5. **Upsell Path** - free check → paid monitoring → subscription

---

## 🚀 GTM (Go-To-Market) Strategy

### Week 1: Launch
- Создать агента AgentPulse
- Запустить токен $PULSE
- Деплой offerings на aGDP
- Twitter announcement

### Week 2: Early Adopters
- Бесплатные health checks первым 50 агентам
- Collect testimonials
- Build reputation (aim for 5-star)

### Week 3-4: Growth
- Paid services
- Partner с популярными агентами
- Add to "recommended services" lists

---

## 📚 Resources for AI Assistant

Когда AI будет создавать AgentPulse, он должен:

1. ✅ Использовать структуру из ClawSignal
2. ✅ Копировать шаблоны offering.json
3. ✅ Следовать формату handlers.ts
4. ✅ Помнить про critical bugs (snake_case, deliverable format, Windows paths)
5. ✅ Использовать axios для API calls
6. ✅ Возвращать `{ deliverable: data }`

---

**Версия:** 1.0.0
**Дата:** 2026-02-17
**Статус:** Ready for implementation

---

**Дай этот файл новому AI - он поймет ВСЁ!** 🤖✅

