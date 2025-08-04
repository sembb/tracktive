"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const apiUrl = process.env.NEXT_PUBLIC_API_ADDRESS || 'http://localhost:8000';
    const res = await fetch(`${apiUrl}/api/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      credentials: "omit",  // <- heel belangrijk!
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setMessage("Registratie gelukt! Je kunt nu inloggen.");
      setForm({ name: "", email: "", password: "", password_confirmation: "" });
    } else {
      const errorData = await res.json();
      setMessage("Fout: " + (errorData.message || "Onbekende fout"));
    }
  };

  return (
    <div>
      <h1>Registreren</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Naam"
          required
        />
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="E-mail"
          required
        />
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Wachtwoord"
          required
        />
        <input
          type="password"
          name="password_confirmation"
          value={form.password_confirmation}
          onChange={handleChange}
          placeholder="Herhaal wachtwoord"
          required
        />
        <button type="submit">Registreren</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}