![Node.js](https://img.shields.io/badge/node-24.4.1-green.svg)
![TypeScript](https://img.shields.io/badge/typescript-^5.8.3-blue.svg)
![@nestjs/core](https://img.shields.io/badge/@nestjs/core-^11.1.5-red.svg)
![@nestjs/cli](https://img.shields.io/badge/@nestjs/cli-^11.0.7-red.svg)
<!-- ![Jest](https://img.shields.io/badge/jest-^30.0.4-purple.svg) -->

# 🕹️ Scopely ⚔️🛡️ Battle Engine 🧮🩸

This repository contains the implementation of the **Backend Development Hands-On Test** made by **Scopely**. The goal is to build a simple core system for a turn-based fighting game, focusing on Clean Architecture, game logic, and turn management.

## 🎛️ Running the app

`1.` Set up your `.env`

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
BATTLE_LOCK_TTL="300"

#------------
# Throttler
#------------
THROTTLER_LIMIT="100"
THROTTLER_TTL="60"

#------------
# In-Game
#------------
IN_GAME_DIFFICULTY="NORMAL"
```

`2.` Set the correct Node.js version via the `.nvmrc` file

```
nvm use
```

`3.` Build the app

```
npm run build
```

`4.` Rise the containers

```
docker compose up -d
```

`5.` Optionally, if you wanna bring the containers down

```
docker compose down -v
```

`6.` Run the app on watch mode (don’t worry, migrations auto run on every application launch)

```
npm run start:dev
```

`7.` You can check the app health

```sh
curl --request GET \
  --url http://localhost:3000/health
```

`8.` You can create Players as a Game Master. The `User-Id` has to be the a Game Master ID. A migration has already created that Game Master called `Scopely` for you! Retrieve it and set `gameMasterUUID`

```SQL
SELECT *
FROM game_masters gm;
```

Requires role `GameMasterRole.Moderator` (don’t worry, the `Scopely` Game Master already have that)

```sh
curl --request POST \
  --url http://localhost:3000/players \
  --header 'Content-Type: application/json' \
  --header 'User-Id: gameMasterUUID' \
  --data '{
	"name": "Cool Warrior",
	"description": "Lorem Ipsum Amet Dolor",
	"gold": 1000,
	"silver": 20000,
	"attack": 50,
	"defense": 70,
	"hitPoints": 1000,
	"roles": ["Player"]
}'
```

`9.` You can submit Battles as a Player. The `User-Id` has to be the **CHALLENGER** Player ID. A migration has already created two mock Players called `Dummy` and `Dummier` for you! Retrieve it and set `challengerPlayerUUID` and `opponentPlayerUUID`

```SQL
SELECT *
FROM players p;
```

Requires role `PlayerRole.Player`

```sh
curl --request POST \
  --url http://localhost:3000/battles \
  --header 'Content-Type: application/json' \
  --header 'User-Id: challengerPlayerUUID' \
  --data '{
	"opponentId": "opponentPlayerUUID"
}'
```

`10.` Once a battle concludes, you can retrieve a full snapshot of it’s state by querying the relevant tables

```SQL
SELECT *
FROM game_masters gm;

SELECT *
FROM players p;

SELECT *
FROM battles b;

SELECT *
FROM turns t;
```

`11.` Check the Leaderboard

```sh
curl --request GET \
  --url http://localhost:3000/players/leaderboard \
  --header 'User-Id: playerUUID'
```

## 🧹 Code Quality and Readability

I followed best practices to write **C**lean, **S**ustainable, and **S**calable code — what I like to call CSS. I prioritize clarity and maintainability so others can easily understand and extend the codebase. Plus, I:

- Consistently named variables and functions with purpose and precision to reflect their intent.
- Modularized logic into reusable, single-responsibility functions and components.
- Minimized side effects and embraced predictable patterns by structuring code using consistent, well-known approaches, making debugging and collaboration easier.

## 🧱 Project Architecture

```txt
src/
├── connections/
├── constants/
├── decorators/
├── filters/
├── guards/
├── helpers/
├── interceptors/
├── middlewares/
├── migrations/
├── modules/
│   ├── app/
│   ├── battles/
│   ├── game_masters/
│   ├── health_check/
│   ├── players/
│   └── redis/
└── pipes/
```

I designed the project with a clear, modular folder structure to ensure maintainability and scalability. The `src` directory is organized by responsibility — separating concerns like config, logging, database models/schemas, workers, and queues — which keeps logic isolated and easy to navigate.

## 🧠 Tech Choices and Design Decisions

### 🧩 Why NestJS?

I chose NestJS because it's my favorite Node.js framework. It’s like Express or Fastify on steroids (both of which NestJS can run on top of as underlying HTTP platforms, combining their speed with it’s own powerful abstraction layer) — built with TypeScript, powered by strong architecture principles, and backed by an amazing community. NestJS comes with built-in support for modules, decorators, guards, interceptors, DI, testing tools, and much more. The number of out-of-the-box features that NestJS provides significantly accelerates development, allowing you to focus on business logic rather than boilerplate or infrastructure concerns.

### 🛢 Databases - 🐘 PostgreSQL & 🟥 Redis

The spec suggested using Redis for everything. However, using an in-memory NoSQL store for core persistent data like Players, Battles, and Turns didn’t feel right — especially since these are non-ephemeral (i.e., persistent and critical for gameplay and progression). Instead, I used:

* **PostgreSQL**: A fine-grained SQL RDBMS to store all game entities.
* **Redis**: Specifically used for locking player availability and queue management via BullMQ. Redis is great for fast access, but storing core entities like battles in memory risks data loss and consistency issues on crash or restart.

### 🔐 Role-Based Access Control (RBAC)

Since the app doesn’t feature a traditional sign-up/sign-in system, I introduced a Basic RBAC layer to control access based on roles. This ensures endpoints are protected while keeping the logic lightweight and spec-compliant.

The system uses two enums to define roles:

* `PlayerRole`: `Player`, `PremiumPlayer`, `ClanLeader`
* `GameMasterRole`: `Moderator`, `EventManager`, `SupportAgent`

For this implementation:

* `GameMasterRole.Moderator` — Can create players.
* `PlayerRole.Player` — Can initiate battles.

This setup allows for future expansion, where premium players or clan leaders might have special privileges. Role enforcement is handled through custom decorators and guards, ensuring only users with valid roles can access protected routes.

This adds a lightweight but effective authorization layer, keeping the app secure while staying spec-compliant.

### 🐂 Battle Queue with BullMQ

I used BullMQ to handle battle submissions asynchronously with concurrency control. It integrates easily with NestJS, and it’s robust event listeners offer visibility into job processing, failures, and retries. Plus, it’s built on top of Redis, which aligns with the original spec.

### 🔥 Extra Juicy Logic: Game Difficulty

I introduced a Game Difficulty system that subtly influences hit chances during battle, making combat more dynamic and unpredictable. This wasn't in the original scope but adds a nice game design touch.

### 🩺 App Health Check

I implemented a global health check endpoint that verifies both:

* The HTTP layer is responsive.
* The database connections (PostgreSQL and Redis) are alive.

This is vital for production monitoring and uptime guarantees.

### 📦 Snapshot Storage with JSONB

All the data that “has to be presented to the player” — like detailed battle reports and turn-by-turn logs — is stored in PostgreSQL `jsonb` columns:

* Battle Snapshot: full metadata of the fight.
* Turn Snapshot: damage logs, action flow, etc.

This approach kept the schema simple. Although jsonb fields make querying and indexing harder (and can hurt performance), they’re fine here because this data is read-heavy, not query-intensive, and primarily for display.

### 🌐 CORS and Throttling

I configured CORS globally to ensure that the backend safely accepts requests from trusted frontends. This protects the API from unwanted cross-origin calls, especially in browser environments.

Global throttling limits help mitigate brute-force attacks, spamming, or resource exhaustion, offering basic rate limiting out-of-the-box across all routes.

### 🐳 Docker Setup

I added a full `Dockerfile` and `docker-compose.yml` to:

* Quickly bootstrap the project with PostgreSQL and Redis.
* Simplify onboarding for reviewers or other developers.
* Ensure consistency across environments (no “works on my machine” issues).

This makes local development and production deployment easier, faster, and reproducible.

### 🏆 Leaderboard Optimization with Indexing

Displaying a Player Leaderboard means frequently sorting players by their `score` in descending order. To keep this fast and snappy — especially as the player base scales — I added a dedicated PostgreSQL index:

```ts
CREATE INDEX CONCURRENTLY IF NOT EXISTS "PLAYER_SCORE_DESC_INDEX"
ON "players" ("score" DESC);
```

Why the `DESC` sort in the index? Because that’s the exact order used in the leaderboard query. PostgreSQL can then skip a full table scan and jump straight to the sorted list — major win for performance.

Also, notice the use of `CONCURRENTLY`:

* This avoids locking the `players` table during index creation.
* Since it's a live, critical table, we don’t want to block reads/writes while improving performance.

And because `CREATE INDEX CONCURRENTLY` isn’t allowed inside a transaction, the migration explicitly sets:

```ts
transaction = false;
```

To support this kind of fine-grained control, I also configured TypeORM to run each migration in its own transaction by setting:

```ts
/*
 - Behavior: Each migration runs in its own transaction
 - Pros: Migrations can override transaction = false safely (which is needed for
   the PLAYER_SCORE_DESC_INDEX)
 - Cons: Partial changes if one migration fails (earlier ones aren’t rolled back)
*/
migrationsTransactionMode: "each"
```

This gives more flexibility — especially for special cases like index creation — while still keeping most migrations safe and isolated.

### 🔄 Transactional Battle Processing

Battles are a multi-step, state-changing operation involving several entities:

* Creating the battle
* Resolving a winner & loser
* Applying loot and saving a battle snapshot
* Updating the battle record

To ensure consistency and prevent partial writes (e.g., a winner is chosen but the battle wasn’t saved), I wrapped all of the code related to the process of a battle in a single database transaction.

I explicitly set the `READ COMMITTED` isolation level, which:

* Prevents dirty reads
* Ensures a good balance of consistency and performance
* Aligns with PostgreSQL default and production-ready settings

Even though the battle resolution logic is broken into separate service methods, they all share the same transactional entity manager, so it’s one atomic operation from start to finish.

This setup ensures that battles are resolved reliably, consistently and without any surprise race conditions or partial states.
