import mysql, { type RowDataPacket } from "mysql2/promise";
import { normalizeKenyanPhone } from "@/app/lib/booking";

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST ?? "127.0.0.1",
  port: Number(process.env.MYSQL_PORT ?? 3306),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE ?? "KCS",
  waitForConnections: true,
  connectionLimit: 10,
  timezone: "Z",
});

let schemaReady: Promise<void> | undefined;

async function createTables() {
  await pool.execute(`CREATE TABLE IF NOT EXISTS bookings (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(1000) NOT NULL,
    phone VARCHAR(1000) NOT NULL,
    phone_normalized VARCHAR(16) NOT NULL,
    suitType VARCHAR(1000) NOT NULL,
    date VARCHAR(1000) NOT NULL,
    time VARCHAR(1000) NOT NULL,
    email VARCHAR(1000) NOT NULL DEFAULT '',
    occasion VARCHAR(1000) NOT NULL DEFAULT '',
    chest VARCHAR(1000) NOT NULL DEFAULT '',
    waist VARCHAR(1000) NOT NULL DEFAULT '',
    shoulder VARCHAR(1000) NOT NULL DEFAULT '',
    sleeve VARCHAR(1000) NOT NULL DEFAULT '',
    inseam VARCHAR(1000) NOT NULL DEFAULT '',
    height VARCHAR(1000) NOT NULL DEFAULT '',
    notes TEXT NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX bookings_created_at_idx (created_at),
    UNIQUE KEY bookings_phone_normalized_unique (phone_normalized)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  const [phoneColumn] = await pool.query<RowDataPacket[]>("SHOW COLUMNS FROM bookings LIKE 'phone_normalized'");
  if (phoneColumn.length === 0) {
    await pool.execute("ALTER TABLE bookings ADD COLUMN phone_normalized VARCHAR(16) NULL AFTER phone");
    const [bookings] = await pool.query<(RowDataPacket & { id: string; phone: string })[]>("SELECT id, phone FROM bookings");
    for (const booking of bookings) {
      await pool.execute("UPDATE bookings SET phone_normalized = ? WHERE id = ?", [normalizeKenyanPhone(booking.phone), booking.id]);
    }
    await pool.execute("ALTER TABLE bookings MODIFY phone_normalized VARCHAR(16) NOT NULL");
  }
  const [uniqueIndex] = await pool.query<RowDataPacket[]>("SHOW INDEX FROM bookings WHERE Key_name = 'bookings_phone_normalized_unique'");
  if (uniqueIndex.length === 0) {
    await pool.execute("ALTER TABLE bookings ADD UNIQUE KEY bookings_phone_normalized_unique (phone_normalized)");
  }

  await pool.execute(`CREATE TABLE IF NOT EXISTS reviews (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    rating TINYINT UNSIGNED NOT NULL,
    note VARCHAR(1500) NOT NULL,
    image VARCHAR(255) NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    INDEX reviews_created_at_idx (created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
}

export async function getDatabase() {
  if (!process.env.MYSQL_USER || !process.env.MYSQL_PASSWORD) {
    throw new Error("MySQL is not configured. Set MYSQL_USER and MYSQL_PASSWORD.");
  }
  schemaReady ??= createTables().catch((error) => {
    schemaReady = undefined;
    throw error;
  });
  await schemaReady;
  return pool;
}

export type DbRow = RowDataPacket;
