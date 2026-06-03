"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cadastrarUsuario } from "@/services/useServices";
import { UserFormData } from "@/types/user";

export default function Atividade2Page() {
  const router = useRouter();
  const [form, setForm] = useState<UserFormData>({ nome: "", email: "", telefone: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [erro, setErro] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome || !form.email || !form.telefone) {
      setErro("Preencha todos os campos.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      const id = await cadastrarUsuario(form);
      router.push(`/perfil/${id}`);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao cadastrar.");
      setStatus("error");
    }
  }

  return (
    <main style={{ padding: "2rem", maxWidth: "480px", margin: "0 auto" }}>
      <h1>Cadastro de Usuário</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <input name="nome" placeholder="Nome completo" value={form.nome} onChange={handleChange} required />
        <input name="email" type="email" placeholder="E-mail" value={form.email} onChange={handleChange} required />
        <input name="telefone" type="tel" placeholder="Telefone" value={form.telefone} onChange={handleChange} required />
        {status === "error" && <p style={{ color: "red" }}>{erro}</p>}
        <button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>
    </main>
  );
}