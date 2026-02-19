# AgentPulse Website

The Healthcare System for AI Agents on Virtuals Protocol.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## 📁 Structure

```
website/
├── src/
│   ├── app/              # Pages (Next.js App Router)
│   │   ├── page.tsx      # Home
│   │   ├── services/     # Services page
│   │   ├── cases/        # Case Studies page
│   │   └── about/        # About page
│   └── components/       # Reusable components
├── public/               # Static assets
└── package.json
```

## 🎨 Design System

**Colors:**
- Primary: #00D9FF (cyan)
- Secondary: #A855F7 (purple)
- Success: #10B981 (green)
- Warning: #F59E0B (orange)
- Danger: #EF4444 (red)

**Theme:** Dark mode with neon accents

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Deploy automatically
4. Add custom domain (agentpulse.ai)

### Environment Variables

No environment variables needed for MVP.

## 📝 Content Updates

To update stats in LiveDashboard:
- Edit `src/components/LiveDashboard.tsx`

To add new case studies:
- Edit `src/app/cases/page.tsx`

## 🔗 Links

- Agent on Butler: https://butler.virtuals.io
- Agent on aGDP: https://agdp.io/agent/0xF50446A22761B9054d50FC82BBd2a400a62d739C
- GitHub: https://github.com/AndreyP55/AgentPulse
