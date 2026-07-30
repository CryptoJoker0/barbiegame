# BARBIEFUN-GAME

> Own the NFT. Spin the 777. Collect the Cheese. Win Big.

An exclusive Web3 casino slot machine built on **X1 Blockchain**, gated by **AFRICA NFT** ownership. Players spin 3 reels, chase the legendary 777 Jackpot, collect Cheese Points, and compete on the global leaderboard.

---

## Features

| Feature | Details |
|---|---|
| NFT Gate | AFRICA NFT (ERC-721) on X1 Blockchain |
| Wallets | MetaMask, Phantom, Backpack, X1 Web, X1 Mobile (TestFlight) |
| Game | 3-reel slot machine — 777 Jackpot, Cheese Points, auto-spin, streaks |
| Leaderboard | Global ranking by high score, winnings, or total spins |
| Daily Rewards | Free coins + cheese every 24 hours |
| Achievements | 8 unlockable milestones tracked on-chain |
| Admin Dashboard | Wallet-gated config panel, announcements, leaderboard reset |

---

## Setup

### 1. Clone & install

```bash
git clone <repo>
pnpm install
```

### 2. Environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Key variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (auto-provisioned on Replit) |
| `SESSION_SECRET` | Min 32-char random string |
| `VITE_ADMIN_WALLET_ADDRESS` | Wallet address for Admin Dashboard access |
| `VITE_WALLETCONNECT_PROJECT_ID` | WalletConnect v2 Project ID (future) |

### 3. Configure the NFT contract

Edit `artifacts/barbie-game/src/config/nft.config.ts`:

```ts
export const NFT_CONFIG = {
  contractAddress: '0xYOUR_AFRICA_NFT_CONTRACT_ADDRESS', // ← replace this
  chainId: 204005,
  rpcUrl: 'https://x1rpc.infrafc.org',
  // ...
};
```

The server-side NFT verifier also reads from environment:

```
NFT_CONTRACT_ADDRESS=0xYOUR_AFRICA_NFT_CONTRACT_ADDRESS
NFT_RPC_URL=https://x1rpc.infrafc.org
```

> **Demo mode:** While `contractAddress` is the zero address, NFT verification is bypassed and all wallets are granted access. This is intentional for development.

### 4. Database

Replit provisions PostgreSQL automatically. Run migrations (Drizzle):

```bash
pnpm --filter @workspace/db run push
```

### 5. Run

```bash
# Frontend (barbie-game)
pnpm --filter @workspace/barbie-game run dev

# Backend (api-server)
pnpm --filter @workspace/api-server run dev
```

---

## Architecture

```
artifacts/
  barbie-game/         # React + Vite frontend
    src/
      config/          # nft.config.ts — NFT contract address, chain params
      context/         # WalletContext — wallet connection state
      components/      # Nav, WalletModal, GameScreen, etc.
      pages/           # LandingPage, LeaderboardPage, ProfilePage, AdminPage
      hooks/           # useGameState — slot machine logic

  api-server/          # Express backend
    src/routes/
      players.ts       # GET/PUT /players/:address, /stats
      game.ts          # /game/config, /game/spin, /game/daily-reward
      leaderboard.ts   # GET /leaderboard
      achievements.ts  # GET/POST /achievements/:address
      announcements.ts # CRUD /announcements
      nft.ts           # GET /nft/verify/:address (server-side check)
      admin.ts         # GET/PUT /admin/config, /admin/stats, reset

lib/
  db/                  # Drizzle ORM schema + client
  api-spec/            # OpenAPI spec → codegen source of truth
  api-client-react/    # Generated React Query hooks
  api-zod/             # Generated Zod validators
```

---

## Routes (Frontend)

| Path | Description |
|---|---|
| `/` | Landing page (public) |
| `/game` | Slot machine (NFT required) |
| `/leaderboard` | Global leaderboard (public) |
| `/profile` | Player profile + achievements (wallet required) |
| `/admin` | Admin dashboard (admin wallet required) |

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/game/config` | Game configuration |
| POST | `/api/game/spin` | Record a spin |
| GET | `/api/game/daily-reward/:address` | Daily reward status |
| POST | `/api/game/daily-reward/:address` | Claim daily reward |
| GET | `/api/leaderboard` | Leaderboard (`?sortBy&limit`) |
| GET | `/api/players/:address` | Player profile |
| PUT | `/api/players/:address` | Create/update player |
| GET | `/api/players/:address/stats` | Player stats |
| GET | `/api/achievements/:address` | Player achievements |
| POST | `/api/achievements/:address` | Unlock achievement |
| GET | `/api/announcements` | Active announcements |
| POST | `/api/announcements` | Create announcement (admin) |
| PATCH | `/api/announcements/:id` | Update announcement (admin) |
| DELETE | `/api/announcements/:id` | Delete announcement (admin) |
| GET | `/api/nft/verify/:address` | Server-side NFT ownership check |
| GET | `/api/admin/config` | Admin: game config |
| PUT | `/api/admin/config` | Admin: update config |
| GET | `/api/admin/stats` | Admin: global stats |
| POST | `/api/admin/leaderboard/reset` | Admin: reset leaderboard |

---

## NFT Contract (AFRICA NFT)

- **Network:** X1 Blockchain (Chain ID: 204005)
- **RPC:** https://x1rpc.infrafc.org
- **Explorer:** https://explorer.x1blockchain.net
- **Interface:** ERC-721 (`balanceOf(address)`)
- **Minimum balance:** 1 NFT

---

## Deployment

Deploy on Replit via the **Publish** button. The frontend and API server each run as separate managed workflows with auto-assigned ports.

---

## Acknowledgements

Built on X1 Blockchain · Powered by AFRICA NFT
