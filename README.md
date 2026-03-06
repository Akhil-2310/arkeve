# 🟠 ArkEve — Web3 Event Platform

> **Own your events and community.** A decentralized event platform built on [Arkiv Network](https://arkiv.network) where events, RSVPs, and attendance records are owned by organizers and verifiable on-chain.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Arkiv SDK](https://img.shields.io/badge/Arkiv_SDK-0.6-orange) ![RainbowKit](https://img.shields.io/badge/RainbowKit-2-purple)

---

## ✨ Features

### For Organizers (wallet required)
- **Create organizer profile** — name, bio, avatar, twitter
- **Create events** — title, description, date, time, location, category, capacity, tags, event image
- **Event lifecycle** — draft (upcoming) → live → ended
- **Edit event details** — update any field after creation
- **View RSVPs / attendee list** — see who's attending
- **Dashboard** — stats, active events, past events, status management

### For Attendees (no wallet needed to browse)
- **Browse live events** — public, no wallet required
- **Filter & search** — category chips + keyword search across title, description, location, city
- **View event details** — full event page with image, description, capacity bar
- **RSVP** — single wallet signature to confirm attendance
- **Organizer profiles** — view organizer info and all their events
- **Share events** — copy link button on every event page

---

## 🏗️ Architecture

### Entity Schema

All data is stored as **Arkiv entities** — no traditional database. Three entity types with clear relationships:

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    ORGANIZER     │       │      EVENT       │       │      RSVP       │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ wallet (attr)    │──────→│ organizer (attr) │       │ eventKey (attr)  │
│ name (attr)      │       │ category (attr)  │←──────│ attendee (attr)  │
│ type: organizer  │       │ city (attr)      │       │ status (attr)    │
│ app: arkeve      │       │ status (attr)    │       │ type: rsvp       │
│                  │       │ date (attr)      │       │ app: arkeve      │
│ Payload:         │       │ imageKey (attr)  │       │                  │
│  bio, avatar,    │       │ type: event      │       │ Payload:         │
│  twitter         │       │ app: arkeve      │       │  attendeeName,   │
│                  │       │                  │       │  message          │
│ Expires: 365d    │       │ Payload:         │       │                  │
└─────────────────┘       │  title, desc,    │       │ Expires:         │
                          │  time, location, │       │  eventDate + 1d  │
                          │  capacity, tags  │       └─────────────────┘
                          │                  │
                          │ Expires:         │
                          │  eventDate + 7d  │
                          └─────────────────┘
```

### Queryable Attributes

| Attribute | Used For |
|-----------|----------|
| `app` | Namespace isolation (`arkeve`) |
| `type` | Entity type filtering (`organizer`, `event`, `rsvp`) |
| `status` | Event lifecycle (`upcoming`, `live`, `ended`) — only `live` events shown in browse |
| `category` | Category filter on browse page |
| `city` | City-based filtering |
| `date` | Chronological sorting via `orderBy('date', 'string', 'asc')` |
| `organizer` | Fetch events by organizer wallet |
| `wallet` | Look up organizer profile by wallet address |
| `eventKey` | Fetch RSVPs for a specific event |
| `attendee` | RSVP deduplication (one per wallet per event) |

### Expiration Strategy

| Entity | Expiration | Rationale |
|--------|-----------|-----------|
| Organizer profiles | 365 days | Long-lived identity persisting across events |
| Events | Event date + 7 days | Visible briefly after ending for reference |
| RSVPs | Event date + 1 day | Attendance records only needed through the event |

### Ownership Model

All entities are **wallet-bound**:
- Organizer profiles are owned by the organizer's wallet
- Events are owned by the organizer's wallet (only they can edit/update status)
- RSVPs are owned by the attendee's wallet

### Key Design Decisions

- **Single-transaction image uploads** — images are compressed client-side (WebP, 800x800, 70% quality) and embedded as base64 in the entity payload, avoiding a second transaction
- **Draft → Live flow** — events start as `upcoming` (only visible on dashboard) and only appear on the browse page when the organizer clicks "Go Live"
- **Public read access** — no wallet needed to browse events, view details, or see organizer profiles

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
│   ├── dashboard/page.tsx        # Organizer dashboard (manage events)
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
│   ├── RsvpButton.tsx            # RSVP with dedup check
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
git clone https://github.com/YOUR_USERNAME/arkeve.git
cd arkeve

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and you're ready to go.

### Usage

1. **Browse events** — visit `/browse` (no wallet needed)
2. **Create organizer profile** — connect wallet → `/become-organizer`
3. **Create an event** — from the dashboard, click "Create Event"
4. **Go live** — click "Go Live" on the dashboard to publish to browse page
5. **RSVP** — connect wallet → open an event → click "RSVP"

---

## 🔗 Arkiv Integration

ArkEve uses the [Arkiv Network SDK](https://www.npmjs.com/package/@arkiv-network/sdk) to store all data on-chain:

- **`createPublicClient`** — read-only client for querying entities (browse, search, profiles)
- **`createWalletClient`** — wallet-connected client for creating/updating entities (uses Wagmi connector)
- **`buildQuery().where().orderBy().fetch()`** — attribute-based filtering and sorting
- **`createEntity()`** — create organizer profiles, events, RSVPs
- **`updateEntity()`** — edit event details, change event status
- **`jsonToPayload()`** — serialize structured data into entity payloads
- **`ExpirationTime.fromDays()`** — set differentiated expiration per entity type

All transactions are signed by the user's browser wallet (MetaMask) — no server-side private keys.

---

## 📄 License

MIT
