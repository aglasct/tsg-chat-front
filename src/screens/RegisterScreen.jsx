import React, { useState } from "react";
import Brand from "../components/Brand";
import { API_URL } from "../config";

export default function RegisterScreen({ onGoToLogin, onRegistered }) {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    const username = form.username.trim();

    if (username.length < 3) return setError("O usuário deve ter no mínimo 3 caracteres.");
    if (form.password.length < 6) return setError("A senha deve ter no mínimo 6 caracteres.");

    setError("");
    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email: form.email.trim(), password: form.password }),
      });
      if (!response.ok) {
        const message = (await response.text()).trim();
        throw new Error(message || "Não foi possível realizar o cadastro.");
      }
      onRegistered(username);
    } catch (requestError) {
      setError(requestError.message === "Failed to fetch" ? "Não foi possível conectar ao servidor." : requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <Brand />
        <div className="login-heading">
          <h1>Criar conta</h1>
          <p>Preencha seus dados para entrar no TsgChat.</p>
        </div>
        <form onSubmit={submit}>
          <label htmlFor="register-username">USUÁRIO</label>
          <input id="register-username" name="username" className="login-input" value={form.username} onChange={change} minLength={3} placeholder="Mínimo de 3 caracteres" autoComplete="username" autoFocus required />
          <label htmlFor="register-email">EMAIL</label>
          <input id="register-email" name="email" className="login-input" type="email" value={form.email} onChange={change} placeholder="voce@exemplo.com" autoComplete="email" required />
          <label htmlFor="register-password">SENHA</label>
          <input id="register-password" name="password" className="login-input" type="password" value={form.password} onChange={change} minLength={6} placeholder="Mínimo de 6 caracteres" autoComplete="new-password" required />
          <button className="login-button" type="submit" disabled={submitting}>{submitting ? "Cadastrando..." : "Criar conta"}</button>
        </form>
        {error && <div className="login-error" role="alert">{error}</div>}
        <p className="auth-switch">Já tem uma conta? <button type="button" onClick={onGoToLogin}>Entrar</button></p>
      </div>
    </div>
  );
}
