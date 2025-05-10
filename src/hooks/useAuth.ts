/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
// src/hooks/useAuth.ts

import { create } from "zustand";
import { supabase } from "../lib/supabase";

interface User {
  id: string;
  email: string;
  role: "admin" | "agent";
}

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: "admin" | "agent") => Promise<void>;
  signOut: () => Promise<void>;
  checkUser: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,

  // Função de Login
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    // Verifica se o usuário tem um `role` na tabela `users`
    const { data: userData, error: roleError } = await supabase
      .from("users")
      .select("role")
      .eq("id", data.user?.id)
      .single();

    if (roleError) {
      throw roleError;
    }

    set({
      user: {
        id: data.user?.id!,
        email: data.user?.email!,
        role: userData?.role || "agent", // Caso não tenha role, o valor padrão será "agent"
      },
      loading: false,
    });
  },

  // Função de Cadastro
  // src/hooks/useAuth.ts

signUp: async (email, password, role) => {
  // Verifica se o usuário já existe no Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw error; // Lança o erro caso haja algum problema ao criar o usuário
  }

  // Após criar o usuário, insira o papel (role) na tabela "users"
  const { error: insertError } = await supabase
    .from("users")
    .insert([
      {
        id: data.user?.id,
        email: data.user?.email,
        role,
      },
    ]);

  if (insertError) {
    throw insertError; // Verifica se houve erro na inserção
  }

  set({
    user: {
      id: data.user?.id!,
      email: data.user?.email!,
      role, // Role atribuído
    },
    loading: false,  // Atualiza o loading para false após o cadastro
  });
},


  // Função para sair
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },

  // Função para verificar o usuário autenticado
  checkUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      set({
        user: {
          id: user.id,
          email: user.email!,
          role: userData?.role || "agent", // Se não houver role, assume "agent"
        },
        loading: false,
      });
    }

    set({ loading: false });
  },
}));
