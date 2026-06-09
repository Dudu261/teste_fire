export interface ResumoProfissional {
  experiencias: string;
  objetivos: string;
  competencias: string;
}

export interface User {
  id?: string;        // gerado automaticamente pelo Firestore
  nome: string;
  cargo: string;
  email: string;
  telefone: string;
  cpf: string;
  resumoProfissional: ResumoProfissional;
  habilidades: string[];
  createdAt?: Date;
}

// Tipo para o formulário: sem id e sem createdAt
export type UserFormData = Omit<User, "id" | "createdAt">;