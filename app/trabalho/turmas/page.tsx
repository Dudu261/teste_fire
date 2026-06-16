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

interface CursoOption {
  id: string;
  nome: string;
}

interface Turma {
  id: string;
  nome: string;
  cursoNome: string;
  periodo: string;
  vagas: string;
  createdAt?: string;
}

const formatDate = (value?: Timestamp | { toDate: () => Date } | string) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.toDate().toLocaleString();
};

export default function TurmasPage() {
  const [nome, setNome] = useState("");
  const [cursoId, setCursoId] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [vagas, setVagas] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [cursos, setCursos] = useState<CursoOption[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);

  useEffect(() => {
    loadCursos();
    loadTurmas();
  }, []);

  async function loadCursos() {
    try {
      const cursosRef = collection(db, "cursos");
      const snapshot = await getDocs(query(cursosRef, orderBy("createdAt", "desc")));
      const items = snapshot.docs.map((doc) => ({ id: doc.id, nome: doc.data().nome || "Curso" }));
      setCursos(items);
    } catch (err) {
      console.error(err);
      setMessage("Erro ao carregar cursos. Verifique o Firestore.");
    }
  }

  async function loadTurmas() {
    try {
      const turmasRef = collection(db, "turmas");
      const snapshot = await getDocs(query(turmasRef, orderBy("createdAt", "desc")));
      const items = snapshot.docs.map((doc) => {
        const data = doc.data() as {
          nome?: string;
          cursoNome?: string;
          periodo?: string;
          vagas?: string;
          createdAt?: Timestamp | { toDate: () => Date } | string;
        };

        return {
          id: doc.id,
          nome: data.nome || "",
          cursoNome: data.cursoNome || "",
          periodo: data.periodo || "",
          vagas: data.vagas || "",
          createdAt: formatDate(data.createdAt),
        };
      });

      setTurmas(items);
    } catch (err) {
      console.error(err);
      setMessage("Erro ao carregar turmas. Verifique o Firestore.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    if (!nome.trim() || !cursoId || !periodo.trim() || !vagas.trim()) {
      setStatus("error");
      setMessage("Preencha todos os campos e selecione um curso.");
      return;
    }

    const selectedCourse = cursos.find((curso) => curso.id === cursoId);
    if (!selectedCourse) {
      setStatus("error");
      setMessage("Curso selecionado inválido.");
      return;
    }

    try {
      const turmasRef = collection(db, "turmas");
      await addDoc(turmasRef, {
        nome: nome.trim(),
        cursoId,
        cursoNome: selectedCourse.nome,
        periodo: periodo.trim(),
        vagas: vagas.trim(),
        createdAt: serverTimestamp(),
      });

      setStatus("success");
      setMessage("Turma cadastrada com sucesso!");
      setNome("");
      setCursoId("");
      setPeriodo("");
      setVagas("");
      await loadTurmas();
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage("Falha ao cadastrar turma. Verifique o Firestore.");
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
          <Link href="/trabalho" style={{ ...navLinkStyle, background: "rgba(255, 255, 255, 0.04)" }}>
            Cursos
          </Link>
          <Link href="/trabalho/alunos" style={{ ...navLinkStyle, background: "rgba(251, 146, 60, 0.15)", color: "#f8fafc" }}>
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
            Cadastro de Turmas
          </h1>
          <p style={{ marginTop: "1rem", maxWidth: 620, color: "#cbd5e1", fontSize: "1rem" }}>
            Crie turmas vinculadas a cursos existentes. Cada turma registra curso, período e número de vagas.
          </p>
        </section>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem", marginBottom: "1.5rem" }}>
          <label style={{ display: "block", color: "#cbd5e1", fontWeight: 600 }}>
            Nome da turma
            <input value={nome} onChange={(event) => setNome(event.target.value)} placeholder="Ex: Turma A" style={inputStyle} />
          </label>

          <label style={{ display: "block", color: "#cbd5e1", fontWeight: 600 }}>
            Curso
            <select value={cursoId} onChange={(event) => setCursoId(event.target.value)} style={inputStyle}>
              <option value="">Selecione um curso</option>
              {cursos.map((curso) => (
                <option key={curso.id} value={curso.id}>{curso.nome}</option>
              ))}
            </select>
          </label>

          <label style={{ display: "block", color: "#cbd5e1", fontWeight: 600 }}>
            Período
            <input value={periodo} onChange={(event) => setPeriodo(event.target.value)} placeholder="Ex: Noite" style={inputStyle} />
          </label>

          <label style={{ display: "block", color: "#cbd5e1", fontWeight: 600 }}>
            Vagas
            <input value={vagas} onChange={(event) => setVagas(event.target.value)} placeholder="Ex: 30" style={inputStyle} />
          </label>

          <button type="submit" disabled={status === "loading"} style={buttonStyle}>
            {status === "loading" ? "Salvando..." : "Salvar turma"}
          </button>
        </form>

        {message && (
          <p style={{ marginTop: "1rem", color: status === "error" ? "#fda4af" : "#a3e635", fontWeight: 600 }}>
            {message}
          </p>
        )}

        <section style={{ marginTop: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <h2 style={{ margin: 0, color: "#f8fafc" }}>Turmas cadastradas</h2>
            <span style={{ color: "#94a3b8", fontSize: "0.95rem" }}>{turmas.length} turma(s)</span>
          </div>

          {turmas.length === 0 ? (
            <p style={{ marginTop: "1rem", color: "#cbd5e1" }}>Nenhuma turma encontrada ainda.</p>
          ) : (
            <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
              {turmas.map((turma) => (
                <article key={turma.id} style={{ border: "1px solid rgba(148, 163, 184, 0.16)", borderRadius: 18, padding: "1.25rem", background: "rgba(15, 23, 42, 0.9)" }}>
                  <strong style={{ display: "block", fontSize: "1.1rem", marginBottom: "0.4rem", color: "#f8fafc" }}>
                    {turma.nome}
                  </strong>
                  <p style={{ margin: "0 0 0.5rem", color: "#cbd5e1" }}><strong>Curso:</strong> {turma.cursoNome}</p>
                  <p style={{ margin: "0 0 0.5rem", color: "#cbd5e1" }}><strong>Período:</strong> {turma.periodo}</p>
                  <p style={{ margin: 0, color: "#cbd5e1" }}><strong>Vagas:</strong> {turma.vagas}</p>
                  {turma.createdAt && <p style={{ margin: "0.65rem 0 0", fontSize: "0.9rem", color: "#94a3b8" }}>Criado em: {turma.createdAt}</p>}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
