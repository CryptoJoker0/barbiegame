# BARBIEFUN-GAME

A Web3 casino slot machine gated by AFRICA NFT ownership on X1 Blockchain. Players connect a wallet, spin 3 reels chasing the 777 Jackpot, collect Cheese Points, and compete on a global leaderboard.

## Run & Operate

- `pnpm --filter @workspace/barbie-game run dev` — run the React frontend (Vite, auto-port)
- `pnpm --filter @workspace/api-server run dev` — run the Express API server (auto-port)
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 20, TypeScript 5.9
- Frontend: React 19 + Vite + Tailwind CSS v4
- API: Express 5
- DB: PostgreSQL (Replit-managed) + Drizzle ORM
- Blockchain: X1 (Chain ID 204005), ethers.js v5
- NFT gate: AFRICA NFT (ERC-721) — demo mode bypasses check when contract address is zero

## Where things live

- `artifacts/barbie-game/` — React frontend (slot machine UI, wallet connect, leaderboard)
- `artifacts/api-server/` — Express API server (game logic, leaderboard, NFT verify, admin)
- `lib/db/` — Drizzle schema + DB client
- `lib/api-zod/` — Zod schemas generated from OpenAPI spec
- `lib/api-client-react/` — React Query hooks for API
- `artifacts/barbie-game/src/config/nft.config.ts` — NFT contract address & chain config

## Environment Variables

| Key | Description | Status |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection (auto-provisioned) | ✓ managed |
| `SESSION_SECRET` | Min 32-char session key | ✓ set |
| `VITE_ADMIN_WALLET_ADDRESS` | Wallet with admin dashboard access | optional |
| `VITE_WALLETCONNECT_PROJECT_ID` | WalletConnect v2 Project ID | optional |

## NFT Contract

Configure in `artifacts/barbie-game/src/config/nft.config.ts`. While `contractAddress` is the zero address, NFT verification is bypassed (demo mode — all wallets get access).

## Architecture decisions

- Monorepo: frontend and API server are separate artifacts, each with their own managed workflow and auto-assigned port.
- API server bundles with esbuild at dev start (`pnpm run build && pnpm run start` in dev script).
- NFT ownership is verified both client-side (ethers.js) and server-side (`/api/nft/verify/:address`).
- Drizzle ORM with `drizzle-kit push` for schema — no migration files, schema is source of truth.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The API server rebuilds on every `dev` start (esbuild, ~600ms). This is intentional — no hot reload for the backend.
- WalletConnect Project ID is optional; WalletConnect v2 support is marked "future" in the README.
- Admin dashboard at `/admin` requires connecting the wallet set in `VITE_ADMIN_WALLET_ADDRESS`.
