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

interface AlunoOption {
  id: string;
  nome: string;
}

interface TurmaOption {
  id: string;
  nome: string;
  cursoNome: string;
}

interface Matricula {
  id: string;
  alunoNome: string;
  turmaNome: string;
  cursoNome: string;
  status: string;
  dataHora?: string;
  createdAt?: string;
}

const formatDate = (value?: Timestamp | { toDate: () => Date } | string) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.toDate().toLocaleString();
};

export default function MatriculasPage() {
  const [alunos, setAlunos] = useState<AlunoOption[]>([]);
  const [turmas, setTurmas] = useState<TurmaOption[]>([]);
  const [alunoId, setAlunoId] = useState("");
  const [turmaId, setTurmaId] = useState("");
  const [status, setStatus] = useState("matriculado");
  const [message, setMessage] = useState("");
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);

  useEffect(() => {
    loadOptions();
    loadMatriculas();
  }, []);

  async function loadOptions() {
    try {
      const alunosSnapshot = await getDocs(query(collection(db, "alunos"), orderBy("createdAt", "desc")));
      setAlunos(alunosSnapshot.docs.map((doc) => ({ id: doc.id, nome: doc.data().nome || "Aluno" })));
      const turmasSnapshot = await getDocs(query(collection(db, "turmas"), orderBy("createdAt", "desc")));
      setTurmas(turmasSnapshot.docs.map((doc) => ({ id: doc.id, nome: doc.data().nome || "Turma", cursoNome: doc.data().cursoNome || "" })));
    } catch (err) {
      console.error(err);
      setMessage("Erro ao carregar alunos e turmas. Verifique o Firestore.");
    }
  }

  async function loadMatriculas() {
    try {
      const matriculasRef = collection(db, "matriculas");
      const snapshot = await getDocs(query(matriculasRef, orderBy("createdAt", "desc")));
      const items = snapshot.docs.map((doc) => {
        const data = doc.data() as {
          alunoNome?: string;
          turmaNome?: string;
          cursoNome?: string;
          status?: string;
          dataHora?: Timestamp | { toDate: () => Date } | string;
          createdAt?: Timestamp | { toDate: () => Date } | string;
        };

        return {
          id: doc.id,
          alunoNome: data.alunoNome || "",
          turmaNome: data.turmaNome || "",
          cursoNome: data.cursoNome || "",
          status: data.status || "",
          dataHora: formatDate(data.dataHora),
          createdAt: formatDate(data.createdAt),
        };
      });

      setMatriculas(items);
    } catch (err) {
      console.error(err);
      setMessage("Erro ao carregar matrículas. Verifique o Firestore.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState("loading");
    setMessage("");

    if (!alunoId || !turmaId) {
      setSubmitState("error");
      setMessage("Selecione aluno e turma para matricular.");
      return;
    }

    const selectedAluno = alunos.find((item) => item.id === alunoId);
    const selectedTurma = turmas.find((item) => item.id === turmaId);

    if (!selectedAluno || !selectedTurma) {
      setSubmitState("error");
      setMessage("Aluno ou turma inválidos.");
      return;
    }

    try {
      const matriculasRef = collection(db, "matriculas");
      await addDoc(matriculasRef, {
        alunoId,
        alunoNome: selectedAluno.nome,
        turmaId,
        turmaNome: selectedTurma.nome,
        cursoNome: selectedTurma.cursoNome,
        status,
        dataHora: serverTimestamp(),
        createdAt: serverTimestamp(),
      });

      setSubmitState("success");
      setMessage("Matrícula realizada com sucesso!");
      setAlunoId("");
      setTurmaId("");
      setStatus("matriculado");
      await loadMatriculas();
    } catch (err) {
      console.error(err);
      setSubmitState("error");
      setMessage("Falha ao salvar matrícula. Verifique o Firestore.");
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
    background: submitState === "loading" ? "#f59e0b" : "#fb923c",
    color: "#0f172a",
    border: "none",
    borderRadius: 14,
    cursor: submitState === "loading" ? "wait" : "pointer",
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
          <Link href="/trabalho/alunos" style={{ ...navLinkStyle, background: "rgba(255, 255, 255, 0.04)" }}>
            Alunos
          </Link>
          <Link href="/trabalho/turmas" style={{ ...navLinkStyle, background: "rgba(255, 255, 255, 0.04)" }}>
            Turmas
          </Link>
          <Link href="/trabalho/matriculas" style={{ ...navLinkStyle, background: "rgba(251, 146, 60, 0.15)", color: "#f8fafc" }}>
            Matrículas
          </Link>
        </nav>

        <section style={{ marginBottom: "2rem" }}>
          <p style={{ textTransform: "uppercase", letterSpacing: "0.16em", color: "#fbbf24", marginBottom: "0.75rem" }}>
            Sistema Acadêmico
          </p>
          <h1 style={{ margin: 0, fontSize: "2.4rem", lineHeight: 1.05, color: "#f8fafc" }}>
            Matrículas
          </h1>
          <p style={{ marginTop: "1rem", maxWidth: 620, color: "#cbd5e1", fontSize: "1rem" }}>
            Matricule alunos em turmas existentes. Cada matrícula registra aluno, turma, curso, status e hora.
          </p>
        </section>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem", marginBottom: "1.5rem" }}>
          <label style={{ display: "block", color: "#cbd5e1", fontWeight: 600 }}>
            Aluno
            <select value={alunoId} onChange={(event) => setAlunoId(event.target.value)} style={inputStyle}>
              <option value="">Selecione um aluno</option>
              {alunos.map((aluno) => (
                <option key={aluno.id} value={aluno.id}>{aluno.nome}</option>
              ))}
            </select>
          </label>

          <label style={{ display: "block", color: "#cbd5e1", fontWeight: 600 }}>
            Turma
            <select value={turmaId} onChange={(event) => setTurmaId(event.target.value)} style={inputStyle}>
              <option value="">Selecione uma turma</option>
              {turmas.map((turma) => (
                <option key={turma.id} value={turma.id}>{turma.nome} — {turma.cursoNome}</option>
              ))}
            </select>
          </label>

          <label style={{ display: "block", color: "#cbd5e1", fontWeight: 600 }}>
            Status
            <select value={status} onChange={(event) => setStatus(event.target.value)} style={inputStyle}>
              <option value="matriculado">Matriculado</option>
              <option value="pendente">Pendente</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </label>

          <button type="submit" disabled={submitState === "loading"} style={buttonStyle}>
            {submitState === "loading" ? "Salvando..." : "Salvar matrícula"}
          </button>
        </form>

        {message && (
          <p style={{ marginTop: "1rem", color: submitState === "error" ? "#fda4af" : "#a3e635", fontWeight: 600 }}>
            {message}
          </p>
        )}

        <section style={{ marginTop: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <h2 style={{ margin: 0, color: "#f8fafc" }}>Matrículas realizadas</h2>
            <span style={{ color: "#94a3b8", fontSize: "0.95rem" }}>{matriculas.length} matrícula(s)</span>
          </div>

          {matriculas.length === 0 ? (
            <p style={{ marginTop: "1rem", color: "#cbd5e1" }}>Nenhuma matrícula encontrada ainda.</p>
          ) : (
            <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
              {matriculas.map((matricula) => (
                <article key={matricula.id} style={{ border: "1px solid rgba(148, 163, 184, 0.16)", borderRadius: 18, padding: "1.25rem", background: "rgba(15, 23, 42, 0.9)" }}>
                  <strong style={{ display: "block", fontSize: "1.1rem", marginBottom: "0.4rem", color: "#f8fafc" }}>
                    {matricula.alunoNome} → {matricula.turmaNome}
                  </strong>
                  <p style={{ margin: "0 0 0.5rem", color: "#cbd5e1" }}><strong>Curso:</strong> {matricula.cursoNome}</p>
                  <p style={{ margin: "0 0 0.5rem", color: "#cbd5e1" }}><strong>Status:</strong> {matricula.status}</p>
                  {matricula.dataHora && <p style={{ margin: "0 0 0.5rem", color: "#94a3b8" }}><strong>Data/Hora:</strong> {matricula.dataHora}</p>}
                  {matricula.createdAt && <p style={{ margin: 0, fontSize: "0.9rem", color: "#94a3b8" }}>Criado em: {matricula.createdAt}</p>}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
