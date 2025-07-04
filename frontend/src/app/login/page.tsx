"use client";

import { useState } from "react";
import { useAuth } from "../../../lib/stores/user";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const apiUrl = process.env.NEXT_PUBLIC_API_ADDRESS || 'http://localhost:8000';
    console.log('API URL:', apiUrl); // Debugging output
    const res = await fetch(`${apiUrl}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // belangrijk voor cookies
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const data = await res.json();
      useAuth.getState().setUser(data.user)
      setMessage(`Welkom, ${data.user.name}`);
      // Hier kan je token opslaan of user status bijhouden
    } else {
      setMessage("Login mislukt");
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Wachtwoord"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Login</button>
      <p>{message}</p>
    </form>
  );
}