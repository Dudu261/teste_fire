import { buscarUsuario } from "@/services/useServices";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PerfilPage({ params }: Props) {
  const { id } = await params;
  const usuario = await buscarUsuario(id);

  if (!usuario) notFound();

  return (
    <main style={{ padding: "2rem" }}>
      <h1>✅ Cadastro realizado!</h1>
      <p><strong>ID Firestore:</strong> {id}</p>
      <p><strong>Nome:</strong> {usuario.nome}</p>
      <p><strong>Cargo desejado:</strong> {usuario.cargo}</p>
      <p><strong>CPF:</strong> {usuario.cpf}</p>
      <p><strong>E-mail:</strong> {usuario.email}</p>
      <p><strong>Telefone:</strong> {usuario.telefone}</p>
      <section style={{ marginTop: "1.5rem" }}>
        <h2>Resumo profissional</h2>
        <p><strong>Experiências profissionais:</strong> {usuario.resumoProfissional.experiencias}</p>
        <p><strong>Objetivos de carreira:</strong> {usuario.resumoProfissional.objetivos}</p>
        <p><strong>Principais competências:</strong> {usuario.resumoProfissional.competencias}</p>
      </section>
      <section style={{ marginTop: "1rem" }}>
        <h2>Habilidades</h2>
        <ul>
          {usuario.habilidades.map((habilidade, index) => (
            <li key={index}>{habilidade}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}