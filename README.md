# Leaf Health AI (LeafCheck)

An AI-powered agricultural intelligence application for leaf disease detection, treatment advice, and crop health analysis designed for farmers.

## Features

- **Leaf Diagnosis Pipeline**: Instant leaf disease identification with actionable organic and chemical treatment advice.
- **Weather & Smart Alerts**: Localized agricultural weather forecast, air quality indices, soil moisture estimates, and spray advisors.
- **Outbreak Probability**: Real-time regional risk monitoring for common plant diseases and pests.
- **Knowledge Base**: Offline-ready encyclopedia of plant diseases, pests, and symptoms.
- **AI Plant Doctor Chat**: Interactive multilingual agronomy assistant.
- **PWA & Offline Support**: Progressive Web App with caching and offline diagnosis queuing.

## Getting Started

### Prerequisites

- Node.js 22+
- npm

### Installation

```bash
# Clone repository
git clone https://github.com/Rahat69x/LeafHealthai.git
cd LeafHealthai

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

### Docker

```bash
docker-compose up --build
```

## Tech Stack

- **Framework**: TanStack Start (SSR) & TanStack Router
- **Runtime & Server**: Nitro
- **UI & Styling**: React 19, Tailwind CSS v4, Radix UI
- **Build Tool**: Vite 8
- **Language**: TypeScript
