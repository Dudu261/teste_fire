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
      <p><strong>E-mail:</strong> {usuario.email}</p>
      <p><strong>Telefone:</strong> {usuario.telefone}</p>
    </main>
  );
}