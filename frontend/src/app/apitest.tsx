"use client";

import { useEffect, useState } from "react";

export default function PingTest() {
  const [response, setResponse] = useState("");
  const apiUrl = process.env.NEXT_PUBLIC_API_ADDRESS || 'http://localhost:8000';
  useEffect(() => {
    fetch(`${apiUrl}/api/user`, {
      method: 'GET',
      credentials: 'include', // important if you're using cookies for auth
      headers: {
        'Content-Type': 'application/json',
        // If using token auth, include the Authorization header like below:
        // 'Authorization': `Bearer ${yourToken}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setResponse(data.title))
      .catch((err) => {
        console.error("Fout bij ophalen:", err);
        setResponse("Fout bij verbinden met backend");
      });
  }, []);
  return (
    <div className="p-4 bg-gray-100 rounded">
      <p>Antwoord van backend: {response}</p>
    </div>
  );
}