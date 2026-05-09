# Stockwise API

Backend service for the Stockwise inventory management system.

Built with Node.js, Express, Prisma, PostgreSQL, and TypeScript.

---

## Related repositories

- Frontend: https://github.com/coder-gaia/stockwise-web
- API: https://github.com/coder-gaia/stockwise-api

---

## Architecture decisions

### Event-sourced inventory (movements over direct mutation)

Stock quantity is never written directly.

Every inventory change — whether an incoming shipment or an outgoing sale — creates a `Movement` record, while `current_stock` is maintained as a cached derived value.

```txt
POST /products/:id/movements
→ INSERT INTO movements (...)
→ UPDATE products SET current_stock = current_stock ± quantity
```

Both operations run inside a `prisma.$transaction`, making them atomic.

If the process crashes between the two writes, neither persists.

This mirrors how real inventory systems operate:
the movement history is the source of truth, not the stock counter itself.

---

## Layered backend architecture

```txt
routes → controllers → services → repositories
```

Each layer has a single responsibility.

### Routes

Maps HTTP verbs and paths to controllers.

### Controllers

Responsible for:

- request parsing
- validation handling
- response formatting
- HTTP concerns

### Services

Contains business rules.

Examples:

- preventing negative stock
- validating movement types
- ownership checks

### Repositories

The only layer allowed to communicate with Prisma/database.

---

## Validation vs business rules

| Type                    | Example                    | Status            |
| ----------------------- | -------------------------- | ----------------- |
| Validation error        | `quantity` is not a number | `400 Bad Request` |
| Business rule violation | OUT movement exceeds stock | `409 Conflict`    |

A `400` means malformed data.

A `409` means valid data that conflicts with current system state.

---

## Authentication strategy

| Token         | Storage         | Lifetime | Purpose                     |
| ------------- | --------------- | -------- | --------------------------- |
| Access token  | in-memory       | 15 min   | Authenticates API requests  |
| Refresh token | httpOnly cookie | 7 days   | Generates new access tokens |

Access tokens are never stored in:

- localStorage
- sessionStorage

Refresh tokens use secure `httpOnly` cookies.

---

## Tech stack

| Layer      | Technology |
| ---------- | ---------- |
| Runtime    | Node.js    |
| Framework  | Express    |
| Language   | TypeScript |
| ORM        | Prisma     |
| Database   | PostgreSQL |
| Validation | Zod        |
| Auth       | JWT        |

---

## Running locally

### Requirements

- Node.js 18+
- PostgreSQL

---

### Installation

```bash
git clone https://github.com/seu-user/stockwise-api
cd stockwise-api

npm install
```

---

### Environment variables

Create a `.env` file.

```env
DATABASE_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
PORT=3333
```

---

### Database setup

```bash
npx prisma migrate dev
npm run seed
```

---

### Start development server

```bash
npm run dev
```

Server:

```txt
http://localhost:3333
```

---

## Demo credentials

```txt
demo@stockwise.app
demo123
```
