"use client";

import { useState, type FormEvent } from "react";
import { MEASUREMENTS, type Booking } from "@/app/lib/booking";

export default function AdminPage() {
  const [rows, setRows] = useState<Booking[] | null>(null);
  const [error, setError] = useState("");

  async function load(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const key = new FormData(e.currentTarget).get("key") as string;
    const res = await fetch(`/api/bookings?key=${encodeURIComponent(key)}`);
    if (!res.ok) {
      setError("Wrong admin key.");
      setRows(null);
      return;
    }
    setError("");
    setRows(await res.json());
  }

  return (
    <div className="admin">
      <header className="admin__head">KIIN Clothline: Booking Requests</header>
      <main className="admin__body">
        <form onSubmit={load} className="admin__form">
          <input name="key" type="password" placeholder="Admin key" required />
          <button className="btn btn--small">Load bookings</button>
        </form>
        {error && <p className="admin__err">{error}</p>}
        {rows && (rows.length === 0 ? <p>No bookings yet.</p> : (
          <div className="admin__wrap">
            <p>{rows.length} booking(s)</p>
            <table>
              <thead>
                <tr><th>Received</th><th>Name</th><th>Phone</th><th>Email</th><th>Suit</th><th>Occasion</th><th>Date / Time</th><th>Measurements (cm)</th><th>Notes</th></tr>
              </thead>
              <tbody>
                {rows.map((b) => (
                  <tr key={b.id}>
                    <td>{new Date(b.createdAt).toLocaleString()}</td>
                    <td>{b.name}</td>
                    <td><a href={`tel:${b.phone}`}>{b.phone}</a></td>
                    <td>{b.email || "—"}</td>
                    <td>{b.suitType}</td>
                    <td>{b.occasion || "—"}</td>
                    <td>{b.date} {b.time}</td>
                    <td>{MEASUREMENTS.filter((m) => b[m]).map((m) => `${m}: ${b[m]}`).join(", ") || "—"}</td>
                    <td>{b.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </main>
    </div>
  );
}
