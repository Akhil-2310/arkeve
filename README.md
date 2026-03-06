# 🟠 ArkEve — Web3 Event Platform

> **Own your events and community.** A decentralized event platform built on [Arkiv Network](https://arkiv.network) where events, RSVPs, and attendance records are owned by organizers and verifiable on-chain.

## [Live Demo](https://arkeve.vercel.app/)

## [Video Demo](https://www.loom.com/share/5d47b95863dd45369d58d8a5c1906892)

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Arkiv SDK](https://img.shields.io/badge/Arkiv_SDK-0.6-orange) ![RainbowKit](https://img.shields.io/badge/RainbowKit-2-purple)

---

## ✨ Features

### For Organizers (wallet required)
- **Create organizer profile** — name, bio, avatar, twitter
- **Create events** — title, description, date, time, location, category, capacity, tags, event image
- **Event lifecycle** — draft (upcoming) → live → ended
- **Edit event details** — update any field after creation
- **View RSVPs / attendee list** — see confirmed and waitlisted attendees
- **Check-in attendees** — create on-chain proof of attendance
- **Dashboard** — stats, active events, past events, status management

### For Attendees (no wallet needed to browse)
- **Browse live events** — public, no wallet required
- **Filter & search** — category chips + keyword search across title, description, location, city
- **View event details** — full event page with image, description, capacity bar
- **RSVP** — single wallet signature to confirm attendance
- **Join waitlist** — when events are full, join the waitlist
- **Organizer profiles** — view organizer info and all their events
- **Share events** — copy link button on every event page

---

## 🏗️ Architecture

### Entity Schema

All data is stored as **Arkiv entities** — no traditional database. Four entity types with clear relationships:

#### `ORGANIZER` — User profiles for event hosts

| Field | Storage | Description |
|-------|---------|-------------|
| `wallet` | Attribute | Owner's wallet address |
| `name` | Attribute | Display name |
| `bio` | Payload | Organizer bio text |
| `avatar` | Payload | Base64 profile picture |
| `twitter` | Payload | Twitter handle |
| **Expires** | **365 days** | Long-lived identity |

#### `EVENT` — Event listings

| Field | Storage | Description |
|-------|---------|-------------|
| `organizer` | Attribute | Creator's wallet (→ links to Organizer) |
| `category` | Attribute | Filterable category |
| `city` | Attribute | Filterable city |
| `status` | Attribute | `upcoming` / `live` / `ended` |
| `date` | Attribute | ISO date (used for `orderBy` sorting) |
| `imageKey` | Attribute | Event image reference |
| `title`, `description`, `time`, `location`, `capacity`, `tags` | Payload | Event details |
| **Expires** | **eventDate + 7 days** | Persists briefly after ending |

#### `RSVP` — Attendee registrations

| Field | Storage | Description |
|-------|---------|-------------|
| `eventKey` | Attribute | → Links to Event |
| `attendee` | Attribute | Attendee's wallet |
| `status` | Attribute | `confirmed` / `waitlisted` |
| `attendeeName`, `message` | Payload | Optional attendee info |
| **Expires** | **eventDate + 1 day** | Short-lived |

#### `ATTENDANCE` — Proof of attendance (check-in records)

| Field | Storage | Description |
|-------|---------|-------------|
| `eventKey` | Attribute | → Links to Event |
| `attendee` | Attribute | Checked-in attendee's wallet |
| `checkedInBy` | Attribute | Organizer who verified |
| `checkedInAt` | Payload | ISO timestamp of check-in |
| **Expires** | **eventDate + 30 days** | Persists as proof |

### Queryable Attributes & Sorting

| Attribute | Used For |
|-----------|----------|
| `app` | Namespace isolation (`arkeve`) |
| `type` | Entity type filtering (`organizer`, `event`, `rsvp`, `attendance`) |
| `status` | Event lifecycle — only `live` events shown in browse |
| `category` | Category filter chips on browse page |
| `city` | City-based filtering |
| `date` | Chronological sorting via `orderBy('date', 'string', 'asc')` |
| `organizer` | Fetch events by organizer wallet |
| `wallet` | Look up organizer profile by wallet address |
| `eventKey` | Fetch RSVPs and attendance records for a specific event |
| `attendee` | RSVP deduplication (one per wallet per event) |

### Key Design Decisions

- **Single-transaction image uploads** — images are compressed client-side (WebP, 800×800, 70% quality) and embedded as base64 in the entity payload
- **Draft → Live flow** — events start as `upcoming` (only visible on dashboard) and appear on the browse page only when the organizer clicks "Go Live"
- **Public read access** — no wallet needed to browse events, view details, or see organizer profiles
- **Waitlist when full** — instead of blocking RSVPs, attendees can join a waitlist stored as RSVPs with `status: 'waitlisted'`
- **Proof of attendance** — organizers can check in confirmed attendees, creating an on-chain `attendance` entity that persists 30 days as verifiable proof

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Vanilla CSS (custom design system) |
| Wallet | RainbowKit + Wagmi |
| Storage | Arkiv Network (Kaolin testnet) |
| Icons | Lucide React |

---

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Landing page
│   ├── browse/page.tsx           # Browse & filter live events
│   ├── dashboard/page.tsx        # Organizer dashboard
│   ├── become-organizer/page.tsx # Organizer profile creation
│   ├── event/[key]/page.tsx      # Event detail + RSVP
│   ├── organizer/[wallet]/page.tsx # Organizer profile page
│   ├── globals.css               # Design system & all styles
│   └── layout.tsx                # Root layout with providers
├── components/
│   ├── CreateEventForm.tsx       # Create/edit event form
│   ├── EventCard.tsx             # Event card for grids
│   ├── EventFilters.tsx          # Search + category filter bar
│   ├── ImageUpload.tsx           # Image upload with compression
│   ├── OrganizerSetup.tsx        # Organizer registration form
│   ├── RsvpButton.tsx            # RSVP + waitlist
│   ├── Navbar.tsx                # Navigation bar
│   ├── Footer.tsx                # Site footer
│   └── Providers.tsx             # Wagmi + RainbowKit + QueryClient
├── contexts/
│   └── WalletContext.tsx         # Wallet state + organizer lookup
├── hooks/
│   ├── useEvent.ts               # Fetch single event by key
│   ├── useEvents.ts              # Fetch filtered event list
│   └── useRsvps.ts               # Fetch RSVPs for an event
└── lib/
    ├── arkiv.ts                  # Arkiv client setup (public + wallet)
    ├── entities.ts               # All entity CRUD, queries, types
    ├── errors.ts                 # User-friendly error parser
    └── wagmiConfig.ts            # Wagmi chain & transport config
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm
- A browser wallet (MetaMask recommended)

### Setup

```bash
# Clone the repository
git clone https://github.com/Akhil-2310/arkeve.git
cd arkeve

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for local development, or visit the live demo at [arkeve.vercel.app](https://arkeve.vercel.app/).

### Usage

1. **Browse events** — visit `/browse` (no wallet needed)
2. **Create organizer profile** — connect wallet → `/become-organizer`
3. **Create an event** — from the dashboard, click "Create Event"
4. **Go live** — click "Go Live" on the dashboard to publish to browse page
5. **RSVP** — connect wallet → open an event → click "RSVP"
6. **Check in attendees** — from the dashboard, expand attendee list → click "Check In"

---

## 🔗 Arkiv Integration

ArkEve uses the [Arkiv Network SDK](https://www.npmjs.com/package/@arkiv-network/sdk) (`@arkiv-network/sdk`) as its **only** data layer — no traditional database.

## Block Explorer Links

### [Link 1](https://explorer.kaolin.hoodi.arkiv.network/address/0x8b916003D0C8F1f468a720BA4Ab5EA9678bc6e61)

### [Link 2](https://explorer.kaolin.hoodi.arkiv.network/address/0x7B232702D462aD2a9f4fa50E8415b318ABAbdE21)

---

### Client Setup — [`src/lib/arkiv.ts`](src/lib/arkiv.ts)

| Client | Purpose |
|--------|---------|
| `createPublicClient` | Read-only client for all queries — browse page, event details, organizer profiles, RSVP lists |
| `createWalletClient` | Write client using the user's Wagmi connector — every mutation prompts a wallet signature |

### Entity CRUD & Queries — [`src/lib/entities.ts`](src/lib/entities.ts)

This is the core Arkiv integration file containing all entity operations:

**Write operations** (wallet-signed):
| Function | SDK Method | Description |
|----------|-----------|-------------|
| `createOrganizerProfile()` | `createEntity()` | Creates organizer profile with `type: organizer`, expires 365 days |
| `createEvent()` | `createEntity()` | Creates event with attributes for category, city, status, date. Expires eventDate + 7 days |
| `updateEventStatus()` | `updateEntity()` | Transitions event status: `upcoming` → `live` → `ended` |
| `updateEvent()` | `updateEntity()` | Edits event details (title, description, date, etc.) |
| `createRsvp()` | `createEntity()` | Creates RSVP with `status: confirmed` or `status: waitlisted`. Expires eventDate + 1 day |
| `createAttendance()` | `createEntity()` | Creates proof-of-attendance check-in record. Expires eventDate + 30 days |

**Read operations** (public, no wallet needed):
| Function | SDK Method | Description |
|----------|-----------|-------------|
| `queryEvents()` | `buildQuery().where().orderBy().fetch()` | Filters by category, city, `status=live`. Sorts by date ascending |
| `queryEventByKey()` | `getEntity()` | Fetches a single event by its entity key |
| `queryRsvps()` | `buildQuery().where().fetch()` | Fetches all RSVPs for an event (confirmed + waitlisted) |
| `queryAttendances()` | `buildQuery().where().fetch()` | Fetches all check-in records for an event |
| `queryOrganizerByWallet()` | `buildQuery().where().fetch()` | Looks up organizer profile by wallet address |
| `queryEventsByOrganizer()` | `buildQuery().where().fetch()` | Fetches all events by a specific organizer |
| `checkExistingRsvp()` | `buildQuery().where().fetch()` | Deduplication — checks if a wallet already RSVP'd to an event |

**Utilities used:**
- `jsonToPayload()` — serializes JSON data into entity payloads
- `ExpirationTime.fromDays()` — sets differentiated expiration per entity type
- `eq()` — creates equality predicates for attribute-based filtering

### Wallet Config — [`src/lib/wagmiConfig.ts`](src/lib/wagmiConfig.ts)

Configures the Kaolin testnet chain and RainbowKit wallet connector. The wallet provider is initialized in [`src/components/Providers.tsx`](src/components/Providers.tsx) and wallet state (connection, organizer lookup) is managed in [`src/contexts/WalletContext.tsx`](src/contexts/WalletContext.tsx).

### Data Flow

All transactions are signed by the user's browser wallet — no server-side private keys. The read path uses the public client so browsing, searching, and viewing events requires no wallet connection.

---

## 📄 License

MIT
