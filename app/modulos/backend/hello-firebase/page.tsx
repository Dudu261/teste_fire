"use client";

import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../../lib/firebaseconfig";

export default function HelloFirebasePage() {
  const [status, setStatus] = useState("idle");
  const [docId, setDocId] = useState("");

  async function testar() {
    setStatus("loading");
    try {
      const ref = await addDoc(collection(db, "testes"), {
        mensagem: "Hello Firebase! 🔥",
        timestamp: serverTimestamp(),
      });
      setDocId(ref.id);
      setStatus("success");
      console.log("ID do documento:", ref.id);
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Hello Firebase 🔥</h1>
      <button onClick={testar} disabled={status === "loading"}>
        {status === "loading" ? "Gravando..." : "Testar Conexão"}
      </button>
      {status === "success" && (
        <p style={{ color: "green" }}>✅ Gravado! ID: {docId}</p>
      )}
      {status === "error" && (
        <p style={{ color: "red" }}>❌ Erro — verifique o .env.local</p>
      )}
    </main>
  );
}