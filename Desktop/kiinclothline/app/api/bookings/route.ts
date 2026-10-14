import { randomUUID } from "crypto";
import type { NextRequest } from "next/server";
import { getDatabase, type DbRow } from "@/app/lib/db";
import { FIELDS, normalizeKenyanPhone, validateBooking, type Booking } from "@/app/lib/booking";

type BookingRow = DbRow & Record<string, string | Date>;

function toBooking(row: BookingRow): Booking {
  const { created_at, ...fields } = row;
  return { ...fields, createdAt: new Date(String(created_at)).toISOString() } as Booking;
}

export async function POST(request: Request) {
  let input: Record<string, unknown>;
  try {
    input = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const error = validateBooking(input);
  if (error) return Response.json({ error }, { status: 400 });

  const booking = { id: randomUUID(), createdAt: new Date().toISOString() } as Booking;
  for (const field of FIELDS) booking[field] = String(input[field] ?? "").trim().slice(0, 1000);

  try {
    const db = await getDatabase();
    const normalizedPhone = normalizeKenyanPhone(booking.phone);
    const [existing] = await db.execute<DbRow[]>("SELECT id FROM bookings WHERE phone_normalized = ? LIMIT 1", [normalizedPhone]);
    if (existing.length) {
      return Response.json({ error: "This phone number already has a booking. Contact us on WhatsApp if you need to change it." }, { status: 409 });
    }
    const columns = [...FIELDS];
    const values = columns.map((field) => booking[field]);
    await db.execute(
      `INSERT INTO bookings (id, phone_normalized, ${columns.join(", ")}) VALUES (?, ?, ${columns.map(() => "?").join(", ")})`,
      [booking.id, normalizedPhone, ...values],
    );
    return Response.json({ ok: true, id: booking.id }, { status: 201 });
  } catch (cause) {
    if (cause && typeof cause === "object" && "code" in cause && cause.code === "ER_DUP_ENTRY") {
      return Response.json({ error: "This phone number already has a booking. Contact us on WhatsApp if you need to change it." }, { status: 409 });
    }
    console.error("Booking database write failed:", cause);
    return Response.json({ error: "We could not save your booking. Please try again or contact us on WhatsApp." }, { status: 503 });
  }
}

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  if (!key || key !== process.env.ADMIN_KEY) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const db = await getDatabase();
    const [rows] = await db.query<BookingRow[]>("SELECT * FROM bookings ORDER BY created_at DESC");
    return Response.json(rows.map(toBooking));
  } catch (cause) {
    console.error("Booking database read failed:", cause);
    return Response.json({ error: "Could not load bookings." }, { status: 503 });
  }
}
