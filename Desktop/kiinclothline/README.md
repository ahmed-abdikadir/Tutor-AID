# Kiin Clothline

Website for **Kiin Clothline**, a bespoke suit tailor in Eastleigh, Nairobi, Kenya. Built with Next.js (App Router).

## Features

- Information sections: hero, about, services, how it works, visit us (map, hours, phone/WhatsApp, Instagram, TikTok)
- **Collection**: a gallery of tailored suits, filterable by category, with a lightbox
- **Booking form**: customer details, suit type, occasion, preferred fitting date/time, optional measurements and notes
  - Requests are saved by `POST /api/bookings`
  - After submitting, the customer can also send the booking to the shop on WhatsApp with one tap (the message is pre-filled)
- **Admin page** (`/admin`): view booking requests (protected by `ADMIN_KEY`)

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
```

| Env variable | Default      | Purpose                                         |
|--------------|--------------|-------------------------------------------------|
| `MYSQL_HOST` | `127.0.0.1` | MySQL server host |
| `MYSQL_PORT` | `3306` | MySQL server port |
| `MYSQL_USER` | — | MySQL username |
| `MYSQL_PASSWORD` | — | MySQL password |
| `MYSQL_DATABASE` | `KCS` | Database name |
| `ADMIN_KEY` | — | Key for `/admin`; set a long random value |

Booking and review records are stored in MySQL. The API creates the `bookings` and `reviews` tables on first use. Each Kenyan phone number can have one booking; `07…` and `+254…` formats are treated as the same number. Copy `.env.example` to `.env.local` and set the database credentials before running the app. The supplied local configuration is kept in the ignored `.env.local` file.

Review image files are saved under `public/reviews`; use persistent/object storage for those files when deploying to an environment with an ephemeral filesystem. For production, configure `MYSQL_*` variables to point to a database reachable from the deployed app; `localhost` only works when MySQL runs on the same machine.

## Editing content

- **Shop details** (phone, WhatsApp, Instagram, map): `app/lib/site.ts`
- **Suits gallery**: the `suits` list in `app/lib/site.ts`. The images are web-optimised copies in `public/suits/`. The originals stay in `public/Images/`.
- **Booking options** (suit types, time slots): `app/lib/booking.ts`
