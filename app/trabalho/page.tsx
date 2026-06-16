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
    <main style={{ padding: "2rem", maxWidth: 760, margin: "0 auto" }}>
      <h1>Cadastrar Curso</h1>
      <p>Use este formulário para cadastrar cursos na coleção <strong>cursos</strong> do Firestore.</p>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
        <label style={{ display: "block" }}>
          Nome do curso
          <input
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            placeholder="Ex: Desenvolvimento Web"
            style={{ width: "100%", padding: "0.75rem", marginTop: "0.5rem" }}
          />
        </label>

        <label style={{ display: "block" }}>
          Descrição
          <textarea
            value={descricao}
            onChange={(event) => setDescricao(event.target.value)}
            placeholder="Ex: Curso de formação em desenvolvimento front-end"
            style={{ width: "100%", minHeight: "120px", padding: "0.75rem", marginTop: "0.5rem" }}
          />
        </label>

        <label style={{ display: "block" }}>
          Carga horária
          <input
            value={cargaHoraria}
            onChange={(event) => setCargaHoraria(event.target.value)}
            placeholder="Ex: 120 horas"
            style={{ width: "100%", padding: "0.75rem", marginTop: "0.5rem" }}
          />
        </label>

        <button
          type="submit"
          disabled={status === "loading"}
          style={{ padding: "0.85rem 1.25rem", background: "#2563eb", color: "white", border: "none", cursor: "pointer" }}
        >
          {status === "loading" ? "Salvando..." : "Salvar curso"}
        </button>
      </form>

      {message && (
        <p style={{ marginTop: "1rem", color: status === "error" ? "#b91c1c" : "#166534" }}>{message}</p>
      )}

      <section style={{ marginTop: "2rem" }}>
        <h2>Cursos cadastrados</h2>
        {cursos.length === 0 ? (
          <p>Nenhum curso encontrado ainda.</p>
        ) : (
          <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
            {cursos.map((curso) => (
              <article key={curso.id} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "1rem" }}>
                <strong>{curso.nome}</strong>
                <p>{curso.descricao}</p>
                <p style={{ margin: 0 }}><em>Carga horária:</em> {curso.cargaHoraria}</p>
                {curso.createdAt && <p style={{ margin: 0, fontSize: "0.9rem", color: "#6b7280" }}>Criado em: {curso.createdAt}</p>}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
