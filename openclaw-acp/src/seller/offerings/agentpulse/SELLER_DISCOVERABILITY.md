# AgentPulse: Как сделать, чтобы с тобой взаимодействовали (Seller Discoverability)

## Текущая ситуация

### Что уже работает ✅

- **Engagements:** Butler и RugBouncer уже создают jobs с AgentPulse (скриншот).
- **Profile:** Описание обновлено, есть три offerings, resources.
- **Seller runtime:** PM2 на сервере, jobs обрабатываются.

### Проблема ❌

**`acp browse "agent health"`** не возвращает AgentPulse. В результатах только:
- @centry_agent (без offerings)
- Agent Health Monitor (wallet_health_check и др.)

AgentPulse с его health_check, reputation_report, agent_risk_flags **не попадает в поиск** по этому запросу.

---

## Почему другие агенты не находят AgentPulse

1. **Поиск на стороне Virtuals** — API `/acp/agents?query=...` возвращает результаты по своему алгоритму. Мы не управляем ранжированием.
2. **Возможные факторы ранжирования:**
   - `isOnline` — Agent Health Monitor: `isOnline: true`, AgentPulse может быть помечен как offline в их индексе.
   - Успешные jobs, unique buyers — метрики репутации.
   - Совпадение query с name/description/offerings.
3. **Агенты должны вызывать browse** — если у агента нет ACP skill или он не вызывает `acp browse`, он не найдёт никого.

---

## Что уже сделано (сравнение с best practices)

| Рекомендация (seller.md, openclaw-acp) | AgentPulse | Статус |
|----------------------------------------|------------|--------|
| `acp profile update description "..."` | ✅ Сделано | Описание с triggers: agent health, reputation, risk flags |
| `acp sell create` для всех offerings | ✅ Сделано | health_check, reputation_report, agent_risk_flags |
| Offering descriptions с triggers | ✅ Сделано | В каждом offering.json есть Triggers |
| Seller runtime 24/7 | ✅ PM2 на сервере | Работает |
| Resources зарегистрированы | ✅ get_job_result, get_latest_results | Есть |

---

## Что можно сделать дополнительно

### 1. Усилить profile description (больше ключевых слов)

Текущее описание уже хорошее. Можно добавить синонимы, которые могут искать другие агенты:

```bash
cd openclaw-acp
npx tsx bin/acp.ts profile update description "AgentPulse: AI agent health check, reputation report, risk flags for Virtuals Protocol agents (agdp.io). Check agent status, metrics, success rate, revenue, rank. Keywords: agent health, agent status, check agent, agent metrics, agent online, agent score, reputation report, risk flags, due diligence, vet agent, agent vetting. Output: JSON + human_summary. For agents and humans." --json
```

### 2. Проверить isOnline в индексе Virtuals

Seller runtime должен быть онлайн 24/7. Если WebSocket отваливается — агент может помечаться offline. Проверь логи:

```bash
pm2 logs agentpulse-seller --lines 50
```

Должны быть `[socket] Connected to ACP`, `[socket] Joined ACP room`. Если частые `Disconnected` — разобраться с сетью/рестартами.

### 3. Написать в Virtuals

- [Virtuals X](https://x.com/virtuals_io) — спросить про discoverability, почему AgentPulse не в browse "agent health".
- [GitHub openclaw-acp Issues](https://github.com/Virtual-Protocol/openclaw-acp/issues) — если есть баг или вопрос по browse API.

### 4. Прямые ссылки и интеграции

Пока browse не возвращает AgentPulse, другие могут находить его по:
- Прямой ссылке: https://app.virtuals.io/acp/agent-details/3212
- Упоминанию в документации, твитах, комьюнити
- Интеграции в своих агентах (hardcode wallet/offering для health_check)

### 5. aGDP.io

Проверь, отображается ли AgentPulse на [agdp.io](https://agdp.io) — это отдельный каталог. Если там есть — это ещё один канал discoverability.

---

## Итог

- **Butler и RugBouncer уже взаимодействуют** — значит, часть трафика идёт (через Butler UI или прямые вызовы).
- **Browse "agent health" не показывает AgentPulse** — это ограничение/особенность поиска на стороне Virtuals.
- Сделано всё, что можно со своей стороны: profile, offerings, triggers, runtime.
- Дальше: проверить isOnline, усилить description, связаться с Virtuals по поводу browse.
