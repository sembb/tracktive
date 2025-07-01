"use client";

import { useEffect, useState } from "react";

export default function PingTest() {
  const [response, setResponse] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/api/films")
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