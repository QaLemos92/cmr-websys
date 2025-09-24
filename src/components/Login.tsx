import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Scale, UserPlus, LogIn } from "lucide-react";

export interface User {
  id: string;
  name: string;
  email: string;
}

interface LoginProps {
  onLogin: (user: User) => void; // 👈 ajustado
}

// Funções para gerenciar usuários no localStorage
const getStoredUsers = (): User[] => {
  const users = localStorage.getItem("dwac-users");
  return users ? JSON.parse(users) : [];
};

const saveUser = (user: User) => {
  const users = getStoredUsers();
  const existingIndex = users.findIndex((u) => u.email === user.email);
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem("dwac-users", JSON.stringify(users));
};

const findUser = (email: string): User | null => {
  const users = getStoredUsers();
  return users.find((u) => u.email === email) || null;
};

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao fazer login");
        return;
      }

      // Backend já grava o cookie JWT
      onLogin(data.user); // ← você pode retornar o usuário na rota de login
    } catch (err) {
      setError("Erro inesperado, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao cadastrar usuário");
        return;
      }

      // Cadastro feito → redireciona direto pro login
      setIsSignupMode(false);
    } catch (err) {
      setError("Erro inesperado, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignupMode(!isSignupMode);
    setError("");
    setEmail("");
    setPassword("");
    setName("");
    setConfirmPassword("");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Scale className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-semibold">Sistema CRM - DWAC</h1>
          </div>
          <p className="text-muted-foreground">
            {isSignupMode
              ? "Cadastre-se para começar"
              : "Faça login para acessar o sistema"}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isSignupMode ? (
                <>
                  <UserPlus className="w-5 h-5" />
                  Cadastro
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Login
                </>
              )}
            </CardTitle>
            <CardDescription>
              {isSignupMode
                ? "Crie sua conta para acessar o sistema CRM"
                : "Entre com suas credenciais para continuar"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={isSignupMode ? handleSignup : handleLogin}
              className="space-y-4"
            >
              {isSignupMode && (
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={
                    isSignupMode ? "Mínimo 6 caracteres" : "Sua senha"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {isSignupMode && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Digite a senha novamente"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading
                  ? isSignupMode
                    ? "Cadastrando..."
                    : "Entrando..."
                  : isSignupMode
                  ? "Cadastrar"
                  : "Entrar"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Button variant="ghost" onClick={toggleMode} className="text-sm">
                {isSignupMode
                  ? "Já tem uma conta? Fazer login"
                  : "Não tem uma conta? Cadastrar-se"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-muted-foreground">
          Sistema de CRM para closers - DWAC
        </div>
      </div>
    </div>
  );
}
