import { collection, addDoc, getDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebaseconfig";
import { UserFormData, User } from "@/types/user";

const COLLECTION = "usuarios";

export async function cadastrarUsuario(dados: UserFormData): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...dados,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function buscarUsuario(id: string): Promise<User | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as User;
}