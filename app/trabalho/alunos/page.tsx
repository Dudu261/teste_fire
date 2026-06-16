"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import {
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { db } from "../../lib/firebaseconfig";

interface Aluno {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpf?: string;
  createdAt?: string;
}

const formatDate = (value?: Timestamp | { toDate: () => Date } | string) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.toDate().toLocaleString();
};

export default function AlunosPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [alunos, setAlunos] = useState<Aluno[]>([]);

  useEffect(() => {
    loadAlunos();
  }, []);

  async function loadAlunos() {
    try {
      const alunosRef = collection(db, "alunos");
      const q = query(alunosRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map((doc) => {
        const data = doc.data() as {
          nome?: string;
          email?: string;
          telefone?: string;
          cpf?: string;
          createdAt?: Timestamp | { toDate: () => Date } | string;
        };

        return {
          id: doc.id,
          nome: data.nome || "",
          email: data.email || "",
          telefone: data.telefone || "",
          cpf: data.cpf || "",
          createdAt: formatDate(data.createdAt),
        };
      });

      setAlunos(items);
    } catch (err) {
      console.error(err);
      setMessage("Erro ao carregar alunos. Verifique o Firestore.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    if (!nome.trim() || !email.trim() || !telefone.trim()) {
      setStatus("error");
      setMessage("Preencha nome, e-mail e telefone para cadastrar.");
      return;
    }

    try {
      const alunosRef = collection(db, "alunos");
      await addDoc(alunosRef, {
        nome: nome.trim(),
        email: email.trim(),
        telefone: telefone.trim(),
        cpf: cpf.trim() || null,
        createdAt: serverTimestamp(),
      });

      setStatus("success");
      setMessage("Aluno cadastrado com sucesso!");
      setNome("");
      setEmail("");
      setTelefone("");
      setCpf("");
      await loadAlunos();
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage("Falha ao cadastrar aluno. Verifique o Firestore.");
    }
  }

  const pageStyle = {
    padding: "2rem",
    maxWidth: 860,
    margin: "0 auto",
    minHeight: "100vh",
    color: "#e2e8f0",
    background: "radial-gradient(circle at top left, #171e36 0%, #0b1120 55%, #020916 100%)",
  };

  const cardStyle = {
    background: "rgba(15, 23, 42, 0.88)",
    border: "1px solid rgba(148, 163, 184, 0.16)",
    borderRadius: 24,
    boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
    padding: "2rem",
    backdropFilter: "blur(12px)",
  };

  const inputStyle = {
    width: "100%",
    padding: "1rem",
    marginTop: "0.5rem",
    borderRadius: 14,
    border: "1px solid rgba(148, 163, 184, 0.24)",
    background: "#0f172a",
    color: "#e2e8f0",
    outline: "none",
  };

  const buttonStyle = {
    padding: "1rem 1.5rem",
    background: status === "loading" ? "#f59e0b" : "#fb923c",
    color: "#0f172a",
    border: "none",
    borderRadius: 14,
    cursor: status === "loading" ? "wait" : "pointer",
    fontWeight: 700,
    letterSpacing: "0.02em",
    transition: "transform 150ms ease, box-shadow 150ms ease",
    boxShadow: "0 15px 30px rgba(251, 146, 60, 0.24)",
  };

  const navLinkStyle = {
    color: "#cbd5e1",
    textDecoration: "none",
    padding: "0.65rem 1rem",
    borderRadius: 999,
    border: "1px solid transparent",
    transition: "background 150ms ease",
  };

  return (
    <main style={pageStyle}>
      <div style={cardStyle}>
        <nav style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.75rem" }}>
          <Link href="/trabalho" style={{ ...navLinkStyle, background: "rgba(251, 146, 60, 0.15)", color: "#f8fafc" }}>
            Cursos
          </Link>
          <Link href="/trabalho/alunos" style={{ ...navLinkStyle, background: "rgba(255, 255, 255, 0.04)" }}>
            Alunos
          </Link>
          <Link href="/trabalho/turmas" style={{ ...navLinkStyle, background: "rgba(255, 255, 255, 0.04)" }}>
            Turmas
          </Link>
          <Link href="/trabalho/matriculas" style={{ ...navLinkStyle, background: "rgba(255, 255, 255, 0.04)" }}>
            Matrículas
          </Link>
        </nav>

        <section style={{ marginBottom: "2rem" }}>
          <p style={{ textTransform: "uppercase", letterSpacing: "0.16em", color: "#fbbf24", marginBottom: "0.75rem" }}>
            Sistema Acadêmico
          </p>
          <h1 style={{ margin: 0, fontSize: "2.4rem", lineHeight: 1.05, color: "#f8fafc" }}>
            Cadastro de Alunos
          </h1>
          <p style={{ marginTop: "1rem", maxWidth: 620, color: "#cbd5e1", fontSize: "1rem" }}>
            Cadastre alunos com nome, e-mail, telefone e CPF. Os registros são persistidos em Firestore.
          </p>
        </section>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem", marginBottom: "1.5rem" }}>
          <label style={{ display: "block", color: "#cbd5e1", fontWeight: 600 }}>
            Nome do aluno
            <input value={nome} onChange={(event) => setNome(event.target.value)} placeholder="Ex: João Silva" style={inputStyle} />
          </label>

          <label style={{ display: "block", color: "#cbd5e1", fontWeight: 600 }}>
            E-mail
            <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Ex: joao@email.com" style={inputStyle} />
          </label>

          <label style={{ display: "block", color: "#cbd5e1", fontWeight: 600 }}>
            Telefone
            <input value={telefone} onChange={(event) => setTelefone(event.target.value)} placeholder="Ex: (11) 99999-9999" style={inputStyle} />
          </label>

          <label style={{ display: "block", color: "#cbd5e1", fontWeight: 600 }}>
            CPF (opcional)
            <input value={cpf} onChange={(event) => setCpf(event.target.value)} placeholder="Ex: 123.456.789-00" style={inputStyle} />
          </label>

          <button type="submit" disabled={status === "loading"} style={buttonStyle}>
            {status === "loading" ? "Salvando..." : "Salvar aluno"}
          </button>
        </form>

        {message && (
          <p style={{ marginTop: "1rem", color: status === "error" ? "#fda4af" : "#a3e635", fontWeight: 600 }}>
            {message}
          </p>
        )}

        <section style={{ marginTop: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <h2 style={{ margin: 0, color: "#f8fafc" }}>Alunos cadastrados</h2>
            <span style={{ color: "#94a3b8", fontSize: "0.95rem" }}>{alunos.length} aluno(s)</span>
          </div>

          {alunos.length === 0 ? (
            <p style={{ marginTop: "1rem", color: "#cbd5e1" }}>Nenhum aluno encontrado ainda.</p>
          ) : (
            <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
              {alunos.map((aluno) => (
                <article key={aluno.id} style={{ border: "1px solid rgba(148, 163, 184, 0.16)", borderRadius: 18, padding: "1.25rem", background: "rgba(15, 23, 42, 0.9)" }}>
                  <strong style={{ display: "block", fontSize: "1.1rem", marginBottom: "0.4rem", color: "#f8fafc" }}>
                    {aluno.nome}
                  </strong>
                  <p style={{ margin: "0 0 0.5rem", color: "#cbd5e1" }}><strong>E-mail:</strong> {aluno.email}</p>
                  <p style={{ margin: "0 0 0.5rem", color: "#cbd5e1" }}><strong>Telefone:</strong> {aluno.telefone}</p>
                  {aluno.cpf && <p style={{ margin: "0 0 0.5rem", color: "#cbd5e1" }}><strong>CPF:</strong> {aluno.cpf}</p>}
                  {aluno.createdAt && <p style={{ margin: 0, fontSize: "0.9rem", color: "#94a3b8" }}>Criado em: {aluno.createdAt}</p>}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
