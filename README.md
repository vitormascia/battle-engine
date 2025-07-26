![Node.js](https://img.shields.io/badge/node-24.4.1-green.svg)
![TypeScript](https://img.shields.io/badge/typescript-^5.8.3-blue.svg)
![@nestjs/core](https://img.shields.io/badge/@nestjs/core-^11.1.5-red.svg)
![@nestjs/cli](https://img.shields.io/badge/@nestjs/cli-^11.0.7-red.svg)
![Jest](https://img.shields.io/badge/jest-^30.0.4-purple.svg)

# 🕹️ Scopely ⚔️🛡️ Battle Engine 🧮🩸

This repository contains the implementation of the **Backend Development Hands-On Test** made by **Scopely**. The goal is to build a simple core system for a turn-based fighting game, focusing on Clean Architecture, game logic, and turn management.

## 🎛️ Running the app

First things first, set up your `.env`

```env
#-------------
# Application 
#-------------

APP_NAME="battle-engine"
APP_PORT="3000"
NODE_ENV="local"
CORS_ORIGIN="http://localhost:3000,https://example.com"

#------------
# PostgreSQL
#------------

POSTGRES_HOST="localhost"
POSTGRES_PORT="5432"
POSTGRES_USERNAME="root"
POSTGRES_PASSWORD="root"
POSTGRES_DATABASE="battle_engine"

#------------
# Redis
#------------

REDIS_HOST="localhost"
REDIS_PORT="6379"

#------------
# Throttler
#------------
THROTTLER_LIMIT="100"
THROTTLER_TTL="60"
```

1. Lorem
```
npm run start:dev
```
2. Ipsum
```
npm run start:dev
```

## 🧹 Code Quality and Readability

I followed best practices to write **C**lean, **S**ustainable, and **S**calable code — what I like to call CSS. I prioritize clarity and maintainability so others can easily understand and extend the codebase. Plus, I:

- Consistently named variables and functions with purpose and precision to reflect their intent.
- Modularized logic into reusable, single-responsibility functions and components.
- Minimized side effects and embraced predictable patterns by structuring code using consistent, well-known approaches, making debugging and collaboration easier.

## 🧱 Project Architecture

```txt
src/
├── app/
│   ├── config/
│   ├── db/
│   │   ├── models/
│   │   └── schemas/
│   ├── entry_points/
│   └── log/
├── clients/
├── helpers/
├── jobs/
├── middlewares/
├── queues/
├── ts/
└── workers/
```

I designed the project with a clear, modular folder structure to ensure maintainability and scalability. The `src` directory is organized by responsibility — separating concerns like config, logging, database models/schemas, workers, and queues — which keeps logic isolated and easy to navigate. Key highlights:

- `app/` handles core infrastructure like `config/`, `db/` (`db/models/` & `db/schemas/`), and `log/`, promoting separation of setup and logic.
- `clients/`, `helpers/`, `middlewares/`, and `workers/` keep business logic clean and reusable.
- `ts/` holds all type definitions, enums, and interfaces to fully leverage TypeScript for safer, self-documenting code.
- `entry_points/` defines the system's main execution flows, keeping startup logic clean.
- Output is compiled to a `build/` folder, keeping generated JS isolated from source TS.
- `jobs/` defines recurring or scheduled operations, cleanly separated from business logic.
- `queues/` contains queues definitions and initializations, each paired with a Worker as the consumer, enabling asynchronous task processing.

I believe this architecture enables easy onboarding, smooth collaboration, and long-term codebase evolution.
