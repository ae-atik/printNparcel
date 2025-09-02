// src/dev/ApiProbe.tsx
import React, { useState } from "react";
import { login, listUsers, listPrinters } from "../lib/api";

export default function ApiProbe() {
  const [out, setOut] = useState<string>("");

  async function tryLogin() {
    const res = await login({ email: "admin2@campus.edu", password: "admin2pass" });
    setOut(JSON.stringify(res, null, 2));
  }

  async function tryUsers() {
    const res = await listUsers();
    setOut(JSON.stringify(res, null, 2));
  }

  async function tryPrinters() {
    const res = await listPrinters();
    setOut(JSON.stringify(res, null, 2));
  }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1>API Probe</h1>
      <p>BASE_URL = import.meta.env.VITE_API_URL</p>
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <button onClick={tryLogin}>Login (admin2)</button>
        <button onClick={tryUsers}>List Users</button>
        <button onClick={tryPrinters}>List Printers</button>
      </div>
      <pre style={{ padding: 12, background: "#111", color: "#eee", borderRadius: 8, overflowX: "auto" }}>{out}</pre>
    </div>
  );
}
