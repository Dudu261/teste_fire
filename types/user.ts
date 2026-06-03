export interface User {
  id?: string;        // gerado automaticamente pelo Firestore
  nome: string;
  email: string;
  telefone: string;
  createdAt?: Date;
}

// Tipo para o formulário: sem id e sem createdAt
export type UserFormData = Omit<User, "id" | "createdAt">;