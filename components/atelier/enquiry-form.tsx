"use client";

import { useState } from "react";

export function EnquiryForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <p className="font-serif text-2xl text-ink italic">
        Your note is kept. The atelier will read it as if it had arrived on
        paper.
      </p>
    );
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        setSent(true);
      }}
    >
      <label className="block">
        <span className="nav-link text-ink-soft">Name</span>
        <input
          required
          name="name"
          className="mt-2 w-full border-b border-gold/40 bg-transparent py-2 text-ink outline-none focus:border-ink"
        />
      </label>
      <label className="block">
        <span className="nav-link text-ink-soft">Email</span>
        <input
          required
          type="email"
          name="email"
          className="mt-2 w-full border-b border-gold/40 bg-transparent py-2 text-ink outline-none focus:border-ink"
        />
      </label>
      <label className="block">
        <span className="nav-link text-ink-soft">For</span>
        <select
          name="subject"
          className="mt-2 w-full border-b border-gold/40 bg-transparent py-2 text-ink outline-none"
          defaultValue="appointment"
        >
          <option value="appointment">An appointment</option>
          <option value="bridal">A bridal commission</option>
          <option value="menswear">Heritage menswear</option>
          <option value="other">Another matter</option>
        </select>
      </label>
      <label className="block">
        <span className="nav-link text-ink-soft">Note</span>
        <textarea
          required
          name="note"
          rows={5}
          className="mt-2 w-full border-b border-gold/40 bg-transparent py-2 text-ink outline-none focus:border-ink"
        />
      </label>
      <button type="submit" className="outline-btn text-ink">
        Send to the house
      </button>
    </form>
  );
}
