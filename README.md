<![CDATA[<div align="center">

# 🌦️ Guess Ma Weather

**A hyper-modern, cinematic weather web application with Apple-grade glassmorphism, GSAP choreography, and real-time IP-based location detection.**

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Google Cloud](https://img.shields.io/badge/Cloud_Run-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [APIs & Data Sources](#-apis--data-sources)
- [Iconography](#-iconography)
- [Getting Started](#-getting-started)
- [Docker & DevOps](#-docker--devops)
- [Project Structure](#-project-structure)
- [License](#-license)

---

## 🌟 Overview

**Guess Ma Weather** is a flagship-quality weather dashboard built as a Next.js 16 web application. It automatically detects the user's location via their public IP address, fetches hyper-local weather data, and presents it through a stunning, Apple Vision Pro-inspired glassmorphism interface with world-class GSAP animations.

The app is containerized with Docker and optimized for deployment on **Google Cloud Run** for seamless, scalable hosting.

### Key Highlights

- 🎭 **Cinematic GSAP Transitions** — Temperature counter animations, elastic spring card reveals, and 3D perspective cascades
- 🪟 **Apple-Grade Glassmorphism** — 50px frosted blur with 200% saturation, directional light borders, and layered depth
- 🌧️ **Dynamic Weather Scenes** — CSS-driven rain, snow, stars, fog, and lightning rendered in real-time behind the UI
- 📱 **Mobile-First, Web-App Ready** — Feels native on phones with haptic feedback (`navigator.vibrate`), scales beautifully to desktop bento layouts
- 🔒 **Zero API Keys Required** — Uses completely free, open-source weather and geolocation APIs

---

## 🏗️ Architecture

```mermaid
graph TB
    subgraph Client["🖥️ Client Browser"]
        A["User Opens App"] --> B["Onboarding Modal"]
        B -->|"Submits Name"| C["GSAP Exit Animation"]
        C --> D["Fetch IP Location"]
    end

    subgraph APIs["🌐 External APIs"]
        D -->|"GET /json"| E["ipapi.co"]
        E -->|"lat, lon, city"| F["Open-Meteo API"]
        F -->|"Weather JSON"| G["Process Response"]
    end

    subgraph App["⚡ Next.js App"]
        G --> H["Weather Dashboard"]
        H --> I["Dynamic Background"]
        H --> J["Glass Bento Cards"]
        H --> K["Weekly Forecast"]
        H --> L["Live Visitor Feed"]
        B -->|"POST /api/visitors"| M["Visitors API Route"]
        M -->|"In-Memory Store"| L
    end

    subgraph Deploy["🐳 Deployment"]
        N["Dockerfile"] -->|"Multi-Stage Build"| O["Docker Image"]
        O -->|"Deploy"| P["Google Cloud Run"]
    end

    style Client fill:#1a1a2e,stroke:#533483,color:#fff
    style APIs fill:#0f3460,stroke:#4da4ff,color:#fff
    style App fill:#16213e,stroke:#4da4ff,color:#fff
    style Deploy fill:#203a43,stroke:#2c5364,color:#fff
```

### Data Flow

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant App as ⚡ Next.js
    participant IP as 🌍 ipapi.co
    participant WX as 🌦️ Open-Meteo
    participant API as 📡 Visitors API

    U->>App: Enter Name & Submit
    App->>App: GSAP Cinematic Exit Animation
    App->>IP: GET https://ipapi.co/json/
    IP-->>App: { city, lat, lon, country }
    App->>WX: GET /v1/forecast?lat={lat}&lon={lon}
    WX-->>App: { current, daily } weather data
    App->>API: POST /api/visitors { name, location }
    API-->>App: Last 10 visitors array
    App->>App: GSAP Dashboard Entry Choreography
    App->>U: Render Glass Dashboard + Weather Scene
```

---

## ⚙️ Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | ![Next.js](https://img.shields.io/badge/Next.js_16-000?logo=next.js&logoColor=white) | App Router, React 19, SSR/SSG |
| **Language** | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) | Type-safe development |
| **Styling** | ![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-06B6D4?logo=tailwindcss&logoColor=white) | Utility-first CSS framework |
| **Animation** | ![GSAP](https://img.shields.io/badge/GSAP-88CE02?logo=greensock&logoColor=black) | Cinematic timeline choreography |
| **Animation** | ![Framer](https://img.shields.io/badge/Framer_Motion-05F?logo=framer&logoColor=white) | Declarative layout transitions |
| **Icons** | ![Lucide](https://img.shields.io/badge/Lucide_React-F56565?logo=lucide&logoColor=white) | Dynamic SVG weather icons |
| **Date Utils** | ![date-fns](https://img.shields.io/badge/date--fns-770C56?logo=javascript&logoColor=white) | Lightweight date formatting |
| **Container** | ![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white) | Multi-stage production builds |
| **Cloud** | ![GCP](https://img.shields.io/badge/Cloud_Run-4285F4?logo=googlecloud&logoColor=white) | Serverless container hosting |

---

## ✨ Features

### 🎭 Onboarding Experience
- Glassmorphism modal with frosted blur over animated mesh gradient background
- Name capture with disclaimer about the Live Visitors feed
- Persistent sessions via `localStorage` — refreshing keeps you logged in

### 🌡️ Weather Dashboard
- **Massive Temperature Display** — 16rem hero typography with GSAP counter animation from 0
- **Dynamic Condition Labels** — "Sunny", "Clear", "Cloudy", "Rain", "Snow", "Thunderstorm" mapped from WMO codes
- **Daily Summary Tidbits** — Contextual weather advice (e.g., "Don't forget your umbrella!")
- **Bento Box Metrics** — Wind Speed, Humidity, and Visibility in a glass panel
- **5-Day Forecast** — Individual glass cards with per-day icons and temperatures

### 🌧️ Dynamic Weather Backgrounds
Real-time CSS-animated weather scenes rendered behind the glass UI:

| Condition | Visual Effect |
|-----------|--------------|
| ☀️ Clear Day | Clean gradient sky |
| 🌙 Clear Night | Twinkling animated stars |
| ☁️ Cloudy/Fog | Drifting translucent cloud blobs |
| 🌧️ Rain/Showers | Falling rain streaks |
| ❄️ Snow | Softly drifting snowflakes with glow |
| ⛈️ Thunderstorm | Heavy rain + white lightning flashes |

### 🪟 Apple-Grade Glassmorphism
- `backdrop-filter: blur(50px) saturate(200%)` for realistic frosted glass
- Directional light borders (brighter top-left) simulating physical glass thickness
- Separate `.glass-panel` (light) and `.glass-panel-dark` (dark) variants
- All glass panels react to the gradient behind them

### 🌓 Light & Dark Mode
- Toggle via the Sun/Moon button in the navigation bar
- **Dark Mode**: Deep navy gradient with dark glass panels
- **Light Mode**: Weather-adaptive gradient backgrounds (azure for sunny, silver for cloudy, etc.)
- Theme preference persisted to `localStorage`

### 📳 Haptic Feedback
- `navigator.vibrate()` API triggers on interactions (button presses, card taps, theme toggles)
- Designed to feel like a native iOS app on supported Android devices

### 👥 Live Visitor Feed
- Server-side in-memory store for the last 10 visitors
- Displays visitor name, location, and timestamp
- Real-time green "Live" indicator with ping animation

---

## 🌐 APIs & Data Sources

### 🌦️ Open-Meteo — Weather Data

> **URL**: `https://api.open-meteo.com/v1/forecast`

Open-Meteo is a fantastic, **free, open-source** weather API that doesn't require API keys or complex authentication, making it incredibly fast and reliable for fetching both real-time conditions and 7-day forecast data.

**Endpoint Used:**
```
GET /v1/forecast
  ?latitude={lat}
  &longitude={lon}
  &current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m,visibility,is_day
  &daily=weather_code,temperature_2m_max,temperature_2m_min
  &timezone=auto
```

**Response Data:**
| Field | Description |
|-------|-------------|
| `current.temperature_2m` | Current temperature in °C |
| `current.weather_code` | WMO weather interpretation code |
| `current.wind_speed_10m` | Wind speed at 10m height (km/h) |
| `current.relative_humidity_2m` | Relative humidity (%) |
| `current.visibility` | Visibility distance (meters) |
| `current.is_day` | 1 = daytime, 0 = nighttime |
| `daily.temperature_2m_max/min` | Daily high/low temperatures |
| `daily.weather_code` | Daily weather condition codes |

### 🌍 ipapi.co — IP Geolocation

> **URL**: `https://ipapi.co/json/`

This API translates the user's public IP address into physical latitude and longitude coordinates, city name, region, and country — which are then handed to Open-Meteo for hyper-local weather fetching.

**Response Data:**
| Field | Description |
|-------|-------------|
| `city` | User's city (e.g., "Brampton") |
| `region` | State/Province |
| `country_name` | Country (e.g., "Canada") |
| `latitude` | Geographic latitude |
| `longitude` | Geographic longitude |

---

## 🎨 Iconography

We use **[Lucide React](https://lucide.dev)** (`lucide-react`) for all iconography. Lucide icons are extremely lightweight, allow us to control stroke width and opacity dynamically through CSS/Tailwind, and perfectly fit the premium Apple-like design aesthetic.

Icons are dynamically mapped to WMO weather codes:

| Icon Component | Usage | Weather Codes |
|---------------|-------|---------------|
| `Sun` / `SunMedium` | Clear, sunny days | 0 (daytime) |
| `Moon` / `MoonStar` | Clear nights + theme toggle | 0 (nighttime) |
| `Cloud` | Cloudy, overcast, snowy, foggy | 1–3, 45–48, 71–77 |
| `CloudRain` | Rain and passing showers | 51–67, 80–82 |
| `CloudLightning` | Severe thunderstorms | 95–99 |
| `Wind` | Wind speed metric | Bento card |
| `Droplets` | Humidity metric | Bento card |
| `Eye` | Visibility metric | Bento card |
| `LogOut` | Session reset button | Navigation |
| `Clock` | Visitor timestamps | Live feed |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20.x
- **npm** ≥ 9.x

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/guessmaweather.git
cd guessmaweather

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Build for Production

```bash
npm run build
npm start
```

---

## 🐳 Docker & DevOps

### Dockerfile

The project includes a **production-ready, multi-stage Dockerfile** optimized for Next.js deployment on Google Cloud Run:

```mermaid
graph LR
    A["📦 Stage 1: base"] -->|"node:20-alpine"| B["📦 Stage 2: deps"]
    B -->|"npm ci"| C["🔨 Stage 3: builder"]
    C -->|"npm run build"| D["🚀 Stage 4: runner"]

    style A fill:#2496ED,stroke:#fff,color:#fff
    style B fill:#2496ED,stroke:#fff,color:#fff
    style C fill:#f59e0b,stroke:#fff,color:#fff
    style D fill:#22c55e,stroke:#fff,color:#fff
```

| Stage | Purpose | Key Actions |
|-------|---------|-------------|
| **base** | Alpine Node.js image | Minimal footprint |
| **deps** | Dependency installation | `npm ci` for deterministic installs |
| **builder** | Application build | `next build` with standalone output |
| **runner** | Production runtime | Copies only standalone output traces |

### Build & Run with Docker

```bash
# Build the image
docker build -t guessmaweather .

# Run locally
docker run -p 3000:3000 guessmaweather
```

### Deploy to Google Cloud Run

```bash
# Authenticate with GCP
gcloud auth login

# Build and push to Container Registry
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/guessmaweather

# Deploy to Cloud Run
gcloud run deploy guessmaweather \
  --image gcr.io/YOUR_PROJECT_ID/guessmaweather \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000
```

### .dockerignore

The `.dockerignore` file explicitly excludes sensitive and unnecessary files:

```
node_modules    # Dependencies rebuilt inside container
.next           # Build output regenerated
.env*           # Environment secrets never shipped
.git            # Version control history
```

### Key Configuration

The `next.config.ts` is set with `output: 'standalone'` which enables Next.js to automatically trace and bundle only the files needed for production, resulting in Docker images as small as **~150MB**.

---

## 📁 Project Structure

```
guessmaweather/
├── src/
│   └── app/
│       ├── api/
│       │   └── visitors/
│       │       └── route.ts          # Last 10 visitors API (GET/POST)
│       ├── globals.css               # Glassmorphism, weather animations, mesh gradients
│       ├── layout.tsx                # Root layout with metadata & viewport
│       └── page.tsx                  # Main app (onboarding, dashboard, GSAP, weather scenes)
├── public/                           # Static assets
├── Dockerfile                        # Multi-stage production build
├── .dockerignore                     # Docker exclusions
├── next.config.ts                    # Standalone output configuration
├── tailwind.config.ts                # Tailwind CSS configuration
├── tsconfig.json                     # TypeScript configuration
├── package.json                      # Dependencies & scripts
└── README.md                         # This file
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ using Next.js, GSAP, Framer Motion, and Apple-grade Glassmorphism**

![Next.js](https://img.shields.io/badge/Next.js-000?logo=next.js&logoColor=white&style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white&style=flat-square)
![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square)
![GSAP](https://img.shields.io/badge/GSAP-88CE02?logo=greensock&logoColor=black&style=flat-square)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white&style=flat-square)

</div>
]]>
