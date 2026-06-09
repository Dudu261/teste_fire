"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cadastrarUsuario } from "@/services/useServices";
import { UserFormData } from "@/types/user";

const initialForm: UserFormData = {
  nome: "",
  cargo: "",
  email: "",
  telefone: "",
  cpf: "",
  resumoProfissional: {
    experiencias: "",
    objetivos: "",
    competencias: "",
  },
  habilidades: ["", "", ""],
};

export default function Atividade2Page() {
  const router = useRouter();
  const [form, setForm] = useState<UserFormData>(initialForm);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [erro, setErro] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleResumoChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      resumoProfissional: { ...prev.resumoProfissional, [name]: value },
    }));
  }

  function handleHabilidadeChange(index: number, value: string) {
    setForm((prev) => ({
      ...prev,
      habilidades: prev.habilidades.map((habilidade, idx) => (idx === index ? value : habilidade)),
    }));
  }

  function adicionarHabilidade() {
    setForm((prev) => ({ ...prev, habilidades: [...prev.habilidades, ""] }));
  }

  function removerHabilidade(index: number) {
    setForm((prev) => ({
      ...prev,
      habilidades: prev.habilidades.filter((_, idx) => idx !== index),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { nome, cargo, email, telefone, cpf, resumoProfissional, habilidades } = form;

    if (
      !nome ||
      !cargo ||
      !email ||
      !telefone ||
      !cpf ||
      !resumoProfissional.experiencias ||
      !resumoProfissional.objetivos ||
      !resumoProfissional.competencias ||
      habilidades.some((habilidade) => !habilidade.trim())
    ) {
      setErro("Por favor, preencha todos os campos e todas as habilidades.");
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
    <main style={{ padding: "2rem", maxWidth: "640px", margin: "0 auto" }}>
      <h1>Cadastro de Currículo</h1>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <input name="nome" placeholder="Nome completo" value={form.nome} onChange={handleChange} required />
        <input name="cargo" placeholder="Cargo desejado" value={form.cargo} onChange={handleChange} required />
        <input name="email" type="email" placeholder="E-mail" value={form.email} onChange={handleChange} required />
        <input name="telefone" type="tel" placeholder="Telefone" value={form.telefone} onChange={handleChange} required />
        <input name="cpf" placeholder="CPF" value={form.cpf} onChange={handleChange} required />

        <fieldset style={{ border: "1px solid #ccc", padding: "1rem" }}>
          <legend>Resumo profissional</legend>
          <textarea
            name="experiencias"
            placeholder="Experiências profissionais"
            value={form.resumoProfissional.experiencias}
            onChange={handleResumoChange}
            rows={4}
            required
          />
          <textarea
            name="objetivos"
            placeholder="Objetivos de carreira"
            value={form.resumoProfissional.objetivos}
            onChange={handleResumoChange}
            rows={3}
            required
          />
          <textarea
            name="competencias"
            placeholder="Principais competências"
            value={form.resumoProfissional.competencias}
            onChange={handleResumoChange}
            rows={3}
            required
          />
        </fieldset>

        <fieldset style={{ border: "1px solid #ccc", padding: "1rem" }}>
          <legend>Habilidades</legend>
          {form.habilidades.map((habilidade, index) => (
            <div key={index} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input
                placeholder={`Habilidade ${index + 1}`}
                value={habilidade}
                onChange={(e) => handleHabilidadeChange(index, e.target.value)}
                required
                style={{ flex: 1 }}
              />
              <button type="button" onClick={() => removerHabilidade(index)}>
                Remover
              </button>
            </div>
          ))}
          <button type="button" onClick={adicionarHabilidade} style={{ marginTop: "0.5rem" }}>
            Adicionar habilidade
          </button>
        </fieldset>

        {status === "error" && <p style={{ color: "red" }}>{erro}</p>}
        <button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>
    </main>
  );
}