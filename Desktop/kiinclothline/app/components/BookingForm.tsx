"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { MEASUREMENTS, SUIT_TYPES, TIMES, validateBooking } from "@/app/lib/booking";
import { site } from "@/app/lib/site";

type Status = { kind: "idle" | "sending" | "ok" | "err"; message?: string; whatsapp?: string };

function whatsappLink(d: Record<string, string>) {
  const measurements = MEASUREMENTS.filter((m) => d[m]).map((m) => `${m} ${d[m]}cm`).join(", ");
  const lines = [
    "Hello Kiin Clothline, I would like to book a fitting.",
    `Name: ${d.name}`,
    `Phone: ${d.phone}`,
    `Suit: ${d.suitType}${d.occasion ? ` (${d.occasion})` : ""}`,
    `Date: ${d.date} at ${d.time}`,
    measurements && `Measurements: ${measurements}`,
    d.notes && `Notes: ${d.notes}`,
  ].filter(Boolean);
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
}

export default function BookingForm() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [invalid, setInvalid] = useState<string[]>([]);
  const [suitType, setSuitType] = useState("");
  const [notes, setNotes] = useState("");
  const [minDate, setMinDate] = useState("");

  useEffect(() => {
    const today = new Date();
    setMinDate(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`);

    const onStyleSelected = (event: Event) => {
      const { title, category } = (event as CustomEvent<{ title: string; category: string }>).detail;
      setSuitType(category);
      setNotes(`Interested in: ${title}`);
    };

    window.addEventListener("kiin:suit-selected", onStyleSelected);
    return () => window.removeEventListener("kiin:suit-selected", onStyleSelected);
  }, []);

  useEffect(() => {
    const openFromBookingLink = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest<HTMLAnchorElement>('a[href="#booking"]');
      if (!link) return;
      event.preventDefault();
      if (!dialogRef.current?.open) dialogRef.current?.showModal();
    };

    document.addEventListener("click", openFromBookingLink);
    return () => document.removeEventListener("click", openFromBookingLink);
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    const error = validateBooking(data);
    if (error) {
      const bad = ["name", "phone", "suitType", "date", "time"].filter((f) => !data[f]?.trim());
      setInvalid(bad.length ? bad : ["phone"]);
      setStatus({ kind: "err", message: error });
      return;
    }
    setInvalid([]);
    setStatus({ kind: "sending", message: "Sending…" });
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Something went wrong.");
      form.reset();
      setSuitType("");
      setNotes("");
      setStatus({
        kind: "ok",
        message: `Thank you, ${data.name}! We have received your booking request for ${data.date} at ${data.time}. We will contact you on ${data.phone} to confirm.`,
        whatsapp: whatsappLink(data),
      });
    } catch (err) {
      setStatus({
        kind: "err",
        message: `${(err as Error).message} You can still send your booking to us on WhatsApp.`,
        whatsapp: whatsappLink(data),
      });
    }
  }

  const cls = (name: string) => (invalid.includes(name) ? "invalid" : undefined);
  const fieldError = (name: string) => invalid.includes(name) ? <span className="field-error">Please complete this field.</span> : null;

  return (
    <>
    <button className="booking-card" type="button" onClick={() => dialogRef.current?.showModal()} aria-haspopup="dialog">
      <span className="booking-card__label">A considered fit begins here</span>
      <span className="booking-card__title">Book your fitting</span>
      <span className="booking-card__copy">Share a few details and our team will help you take the next step.</span>
      <span className="booking-card__link">Book a fitting <span aria-hidden="true">→</span></span>
    </button>
    <dialog className="booking-dialog" ref={dialogRef} aria-labelledby="booking-dialog-title">
      <button className="booking-dialog__close" type="button" aria-label="Close booking form" onClick={() => dialogRef.current?.close()}>×</button>
      <p className="eyebrow">Kiin Clothline · Eastleigh</p>
      <h2 id="booking-dialog-title">Book your fitting</h2>
      <p className="booking-dialog__intro">Tell us a little about what you have in mind.</p>
    <form className="form" onSubmit={onSubmit} noValidate>
      <fieldset>
        <legend>Your details</legend>
        <div className="form__row">
          <label>Full name*<input name="name" autoComplete="name" className={cls("name")} aria-invalid={invalid.includes("name")} />{fieldError("name")}</label>
          <label>Phone number*<input name="phone" type="tel" placeholder="07XX XXX XXX" autoComplete="tel" className={cls("phone")} aria-invalid={invalid.includes("phone")} />{fieldError("phone")}</label>
        </div>
        <label>Email<input name="email" type="email" autoComplete="email" /></label>
      </fieldset>

      <fieldset>
        <legend>Your suit</legend>
        <div className="form__row">
          <label>Suit type*
            <select name="suitType" value={suitType} onChange={(e) => setSuitType(e.target.value)} className={cls("suitType")}>
              <option value="">Select…</option>
              {SUIT_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>{fieldError("suitType")}
          </label>
          <label>Occasion<input name="occasion" placeholder="e.g. Wedding, office, graduation" /></label>
        </div>
        <div className="form__row">
          <label>Preferred fitting date*<input name="date" type="date" min={minDate} className={cls("date")} aria-invalid={invalid.includes("date")} />{fieldError("date")}</label>
          <label>Preferred time*
            <select name="time" defaultValue="" className={cls("time")}>
              <option value="">Select…</option>
              {TIMES.map((t) => <option key={t}>{t}</option>)}
            </select>{fieldError("time")}
          </label>
        </div>
      </fieldset>

      <details className="measurements">
        <summary>Add measurements <span>(optional)</span></summary>
        <fieldset>
          <legend>Measurements in cm</legend>
          <div className="form__row form__row--3">
            {MEASUREMENTS.map((m) => (
              <label key={m} className="capitalize">{m}<input name={m} type="number" min="0" step="0.5" /></label>
            ))}
          </div>
        </fieldset>
      </details>

      <label>Notes / style preferences<textarea name="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Fabric, colour, lapel style, budget…" /></label>

      <button type="submit" className="btn btn--full" disabled={status.kind === "sending"}>Request a fitting</button>
      <div className={`form__status ${status.kind}`} role="status" aria-live="polite">
        {status.message}
        {status.whatsapp && (
          <a className="btn btn--whatsapp" href={status.whatsapp} target="_blank" rel="noopener noreferrer">
            Send details on WhatsApp
          </a>
        )}
      </div>
    </form>
    </dialog>
    </>
  );
}
