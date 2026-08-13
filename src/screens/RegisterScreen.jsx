import React, { useState } from "react";
import Brand from "../components/Brand";
import { API_URL } from "../config";

import * as Valid from "../constants/validation"

export default function RegisterScreen({ verification, onGoToLogin, onRegistered }) {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState(verification?.email || "");
  const [code, setCode] = useState("");

  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    const username = form.username.trim();

    if (username.length < Valid.USERNAME_MIN_LENGTH) {
      return setError("O usuário deve ter no mínimo " + Valid.USERNAME_MIN_LENGTH + " caracteres.");
    }

    if (form.password.length < Valid.PASSWORD_MIN_LENGTH) {
      return setError("A senha deve ter no mínimo " + Valid.PASSWORD_MIN_LENGTH + " caracteres.");
    }

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
      setVerificationEmail(form.email.trim().toLowerCase());
    } catch (requestError) {
      setError(requestError.message === "Failed to fetch" ? "Não foi possível conectar ao servidor." : requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const verifyEmail = async (event) => {
    event.preventDefault();
    if (code.length !== Valid.EMAIL_VERIFICATION_CODE_LENGTH || !/^\d+$/.test(code)) {
      return setError(`Digite o código de ${Valid.EMAIL_VERIFICATION_CODE_LENGTH} dígitos.`);
    }

    setError("");
    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verificationEmail, code }),
      });
      if (!response.ok) {
        const message = (await response.text()).trim();
        throw new Error(message || "Não foi possível verificar o email.");
      }
      onRegistered(verification?.username || form.username.trim());
    } catch (requestError) {
      setError(requestError.message === "Failed to fetch" ? "Não foi possível conectar ao servidor." : requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (verificationEmail) {
    return (
      <div className="login-page">
        <div className="login-card">
          <Brand />
          <div className="login-heading">
            <h1>Confirme seu email</h1>
            <p>Enviamos um código de {Valid.EMAIL_VERIFICATION_CODE_LENGTH} dígitos para {verificationEmail}.</p>
          </div>
          <form onSubmit={verifyEmail}>
            <label htmlFor="verification-code">CÓDIGO DE VERIFICAÇÃO</label>
            <input
              id="verification-code"
              className="login-input verification-code"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, Valid.EMAIL_VERIFICATION_CODE_LENGTH))}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={Valid.EMAIL_VERIFICATION_CODE_LENGTH}
              placeholder="000000"
              autoFocus
              required
            />
            <button className="login-button" type="submit" disabled={submitting || code.length !== Valid.EMAIL_VERIFICATION_CODE_LENGTH}>
              {submitting ? "Verificando..." : "Verificar email"}
            </button>
          </form>
          {error && <div className="login-error" role="alert">{error}</div>}
          <p className="auth-switch"><button type="button" onClick={onGoToLogin}>Voltar ao login</button></p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <Brand />
        <div className="login-heading">
          <h1>Criar conta</h1>
          <p>Me de todos os seus dados</p>
        </div>
        <form onSubmit={submit}>
          <label htmlFor="register-username">USUÁRIO</label>
          <input
            id="register-username"
            name="username"
            className="login-input"
            value={form.username}
            onChange={change}
            minLength={Valid.USERNAME_MIN_LENGTH}
            placeholder={`Mínimo de ${Valid.USERNAME_MIN_LENGTH} caracteres`}
            autoComplete="username"
            autoFocus
            required />
          <label htmlFor="register-email">EMAIL</label>
          <input
            id="register-email"
            name="email"
            className="login-input"
            type="email"
            value={form.email}
            onChange={change}
            placeholder="tem q ser email de vdd"
            autoComplete="email"
            required />
          <label htmlFor="register-password">SENHA</label>
          <input id="register-password"
            name="password"
            className="login-input"
            type="password"
            value={form.password}
            onChange={change}
            minLength={Valid.PASSWORD_MIN_LENGTH}
            placeholder={`Mínimo de ${Valid.PASSWORD_MIN_LENGTH} caracteres`}
            autoComplete="new-password"
            required />
          <button
            className="login-button"
            type="submit"
            disabled={submitting}>
            {submitting ? "Cadastrando..." : "Criar conta"}
          </button>
        </form>
        {error && <div className="login-error" role="alert">{error}</div>}
        <p className="auth-switch">Já vendeu sua alma? <button type="button" onClick={onGoToLogin}>Entra ai entao</button></p>
      </div>
    </div>
  );
}
