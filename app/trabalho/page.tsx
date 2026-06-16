"use client";

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

interface Curso {
  id: string;
  nome: string;
  descricao: string;
  cargaHoraria: string;
  createdAt?: string;
}

export default function CursoTrabalhoPage() {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [cargaHoraria, setCargaHoraria] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [cursos, setCursos] = useState<Curso[]>([]);

  useEffect(() => {
    loadCursos();
  }, []);

  async function loadCursos() {
    try {
      const cursosRef = collection(db, "cursos");
      const q = query(cursosRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map((doc) => {
        const data = doc.data() as {
          nome?: string;
          descricao?: string;
          cargaHoraria?: string;
          createdAt?: Timestamp | { toDate: () => Date } | string;
        };

        return {
          id: doc.id,
          nome: data.nome || "",
          descricao: data.descricao || "",
          cargaHoraria: data.cargaHoraria || "",
          createdAt: data.createdAt && typeof data.createdAt !== "string"
            ? data.createdAt.toDate().toLocaleString()
            : data.createdAt || "",
        };
      });

      setCursos(items);
    } catch (err) {
      console.error(err);
      setMessage("Erro ao carregar cursos. Verifique a conexão com o Firestore.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    if (!nome.trim() || !descricao.trim() || !cargaHoraria.trim()) {
      setStatus("error");
      setMessage("Preencha todos os campos antes de enviar.");
      return;
    }

    try {
      const cursosRef = collection(db, "cursos");
      await addDoc(cursosRef, {
        nome: nome.trim(),
        descricao: descricao.trim(),
        cargaHoraria: cargaHoraria.trim(),
        createdAt: serverTimestamp(),
      });

      setStatus("success");
      setMessage("Curso cadastrado com sucesso!");
      setNome("");
      setDescricao("");
      setCargaHoraria("");
      await loadCursos();
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage("Falha ao cadastrar curso. Verifique o Firestore e as variáveis de ambiente.");
    }
  }

  return (
    <main
      style={{
        padding: "2rem",
        maxWidth: 860,
        margin: "0 auto",
        minHeight: "100vh",
        color: "#e2e8f0",
        background: "radial-gradient(circle at top left, #171e36 0%, #0b1120 55%, #020916 100%)",
      }}
    >
      <div
        style={{
          background: "rgba(15, 23, 42, 0.88)",
          border: "1px solid rgba(148, 163, 184, 0.16)",
          borderRadius: 24,
          boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
          padding: "2rem",
          backdropFilter: "blur(12px)",
        }}
      >
        <section style={{ marginBottom: "2rem" }}>
          <p style={{ textTransform: "uppercase", letterSpacing: "0.16em", color: "#fbbf24", marginBottom: "0.75rem" }}>
            Sistema Acadêmico
          </p>
          <h1 style={{ margin: 0, fontSize: "2.7rem", lineHeight: 1.05, color: "#f8fafc" }}>
            Cadastro de Cursos
          </h1>
          <p style={{ marginTop: "1rem", maxWidth: 620, color: "#cbd5e1", fontSize: "1rem" }}>
            Use este formulário para registrar novos cursos no Firestore e acompanhe a lista atualizada em tempo real.
          </p>
        </section>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <label style={{ display: "block", color: "#cbd5e1", fontWeight: 600 }}>
            Nome do curso
            <input
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              placeholder="Ex: Desenvolvimento Web"
              style={{
                width: "100%",
                padding: "1rem",
                marginTop: "0.5rem",
                borderRadius: 14,
                border: "1px solid rgba(148, 163, 184, 0.24)",
                background: "#0f172a",
                color: "#e2e8f0",
                outline: "none",
              }}
            />
          </label>

          <label style={{ display: "block", color: "#cbd5e1", fontWeight: 600 }}>
            Descrição
            <textarea
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
              placeholder="Ex: Curso de formação em desenvolvimento front-end"
              style={{
                width: "100%",
                minHeight: "140px",
                padding: "1rem",
                marginTop: "0.5rem",
                borderRadius: 14,
                border: "1px solid rgba(148, 163, 184, 0.24)",
                background: "#0f172a",
                color: "#e2e8f0",
                resize: "vertical",
                outline: "none",
              }}
            />
          </label>

          <label style={{ display: "block", color: "#cbd5e1", fontWeight: 600 }}>
            Carga horária
            <input
              value={cargaHoraria}
              onChange={(event) => setCargaHoraria(event.target.value)}
              placeholder="Ex: 120 horas"
              style={{
                width: "100%",
                padding: "1rem",
                marginTop: "0.5rem",
                borderRadius: 14,
                border: "1px solid rgba(148, 163, 184, 0.24)",
                background: "#0f172a",
                color: "#e2e8f0",
                outline: "none",
              }}
            />
          </label>

          <button
            type="submit"
            disabled={status === "loading"}
            style={{
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
            }}
          >
            {status === "loading" ? "Salvando..." : "Salvar curso"}
          </button>
        </form>

        {message && (
          <p
            style={{
              marginTop: "1rem",
              color: status === "error" ? "#fda4af" : "#a3e635",
              fontWeight: 600,
            }}
          >
            {message}
          </p>
        )}

        <section style={{ marginTop: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <h2 style={{ margin: 0, color: "#f8fafc" }}>Cursos cadastrados</h2>
            <span style={{ color: "#94a3b8", fontSize: "0.95rem" }}>{cursos.length} curso(s)</span>
          </div>

          {cursos.length === 0 ? (
            <p style={{ marginTop: "1rem", color: "#cbd5e1" }}>Nenhum curso encontrado ainda.</p>
          ) : (
            <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
              {cursos.map((curso) => (
                <article
                  key={curso.id}
                  style={{
                    border: "1px solid rgba(148, 163, 184, 0.16)",
                    borderRadius: 18,
                    padding: "1.25rem",
                    background: "rgba(15, 23, 42, 0.9)",
                  }}
                >
                  <strong style={{ display: "block", fontSize: "1.1rem", marginBottom: "0.4rem", color: "#f8fafc" }}>
                    {curso.nome}
                  </strong>
                  <p style={{ margin: "0 0 0.75rem", color: "#cbd5e1" }}>{curso.descricao}</p>
                  <p style={{ margin: 0, color: "#94a3b8" }}><em>Carga horária:</em> {curso.cargaHoraria}</p>
                  {curso.createdAt && (
                    <p style={{ margin: "0.65rem 0 0", fontSize: "0.9rem", color: "#94a3b8" }}>
                      Criado em: {curso.createdAt}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
