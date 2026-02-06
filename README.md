# Flux Trade - CFD Options Trading Frontend

A modern, responsive web application for CFD (Contract for Difference) options trading built with **Next.js **, **TypeScript**, and **TradingView Lightweight Charts**. This is a hobby project designed to mimic real-world options trading platforms with real-time price updates and an intuitive user interface.

## 🎯 Project Overview

100xTrade is a frontend application that provides traders with:
- **Real-time price charts** using TradingView Lightweight Charts
- **Live WebSocket price updates** for multiple trading pairs
- **Modern, responsive UI** built with shadcn/ui components
- **OTP-based authentication** (no passwords required)
- **Global state management** using Zustand
- **AI-powered strategy generator** for automated trading rules
- **Advanced order management** with open/closed trade tracking

## 🛠 Tech Stack

### Core Framework
- **Next.js** - React framework with App Router
- **TypeScript** - Type-safe development

### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality, accessible React components
- **Lucide React** - Beautiful SVG icons
- **Sonner** - Toast notifications

### State Management
- **Zustand** - Lightweight state management library
- **TanStack SWR** - Data fetching and caching

### Charts & Data Visualization
- **TradingView Lightweight Charts** - Professional charting library
- **Real-time WebSocket** - Live price streaming

### Authentication
- **Token-based (JWT)** - Bearer token in headers
- **OTP Verification** - Email-based one-time password

## 📦 Installation & Setup

### Prerequisites
- bun package manager
- Backend API running on `http://localhost:8080`
- WebSocket server running on port  `8080` and `8848`

### Installation Steps

```bash
# Clone the repository
git clone https://github.com/Diwaz/option-trading-fe
cd option-trading-fe

# Install dependencies
bun install

# Create .env
cp .env.example .env

# Update environment variables
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8080
NEXT_PUBLIC_WS_CHAT_URL=ws://localhost:8848
```

### Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1

# WebSocket Configuration
NEXT_PUBLIC_WS_URL=ws://localhost:8080
NEXT_PUBLIC_WS_CHAT_URL=ws://localhost:8848

```

### Running the Development Server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🏗 Project Structure

```
src/
├── app/
│   ├── layout.tsx                 # Root layout with navbar & toaster
│   ├── page.tsx                   # Main trading dashboard
│   ├── auth/
│   │   ├── login/page.tsx         # OTP login page
│   │   └── verify/page.tsx        # OTP verification page
│   └── globals.css                # Global styles
├── components/
│   ├── exchange/
│   │   ├── Chart.tsx              # TradingView chart component
│   │   ├── Chat.tsx               # AI strategy generator chat
│   │   ├── order-panel.tsx        # Order creation panel
│   │   ├── order-history.tsx      # Open/Closed trades table
│   │   └── navbar/nav.tsx         # Navigation bar
│   └── ui/
│       └── [shadcn components]    # shadcn/ui components
├── lib/
│   ├── api-client.ts              # API request wrapper
│   ├── auth.ts                    # Authentication utilities
│   └── cn.ts                      # Tailwind class merger
├── store/
│   └── useStore.ts                # Zustand state management
├── types/
│   └── type.ts                    # TypeScript type definitions
```

### Development
```bash
bun run dev
```

## 🤝 Contributing

This is a hobby project, but contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Improve documentation
- Optimize performance

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

Built as a hobby project to learn modern web development, real-time data handling, and trading platform design.

---

## Quick Start Checklist

- [ ] Clone repository
- [ ] Install dependencies: `npm install`
- [ ] Create `.env.local` with API URLs
- [ ] Ensure backend API is running
- [ ] Start dev server: `npm run dev`
- [ ] Open http://localhost:3000
- [ ] Test OTP login flow
- [ ] Verify WebSocket price updates

## Support

For issues, questions, or suggestions, please create an issue in the repository.

---

