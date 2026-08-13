import React, { useState } from "react";
import Brand from "../components/Brand";
import { WS_URL } from "../config";
import imgOi from "../assets/oi.png";

import * as Valid from "../constants/validation"

export default function LoginScreen({ initialUsername, onGoToRegister, onVerificationRequired, onLogin }) {
  const [username, setUsername] = useState(initialUsername);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [connecting, setConnecting] = useState(false);

  const submit = (event) => {
    event.preventDefault();
    const name = username.trim();

    if (name.length < Valid.USERNAME_MIN_LENGTH) {
      setError("O usuário deve ter no mínimo "+Valid.USERNAME_MIN_LENGTH+" caracteres.");
      return;
    }
    if (password.length < Valid.PASSWORD_MIN_LENGTH) {
      setError("A senha deve ter no mínimo "+Valid.PASSWORD_MIN_LENGTH+" caracteres.");
      return;
    }

    setError("");
    setConnecting(true);
    const socket = new WebSocket(WS_URL);
    let authenticated = false;

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "login", username: name, password }));
    };
    socket.onmessage = (message) => {
      let data;
      try {
        data = JSON.parse(message.data);
      } catch {
        setError("O servidor enviou uma resposta inválida.");
        socket.close();
        return;
      }

      if (data.type === "login_success") {
        authenticated = true;
        setConnecting(false);
        socket.onmessage = null;
        socket.onerror = null;
        socket.onclose = null;
        onLogin(name, socket);
      } else if (data.type === "email_verification_required") {
        setConnecting(false);
        socket.onerror = null;
        socket.onclose = null;
        socket.close();
        onVerificationRequired(name, data.email);
      } else if (data.type === "error") {
        setError(data.text || "Não foi possível entrar.");
        setConnecting(false);
        socket.close();
      }
    };
    socket.onerror = () => {
      setError("Não foi possível conectar ao servidor.");
      setConnecting(false);
    };
    socket.onclose = () => {
      if (!authenticated) setConnecting(false);
    };
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <Brand />
        <div className="login-heading">
          <h1>OIIIIII</h1>
          <p>Entra ai :)</p>
        </div>
        <form onSubmit={submit}>
          <label htmlFor="login-username">SEU USUÁRIO</label>
          <input
            id="login-username"
            className="login-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            minLength={Valid.USERNAME_MIN_LENGTH}
            placeholder="Ex: ADEPTO"
            autoComplete="username"
            autoFocus required />
          <label htmlFor="login-password">SENHA</label>
          <input
            id="login-password"
            className="login-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={Valid.PASSWORD_MIN_LENGTH}
            placeholder="Sua senha muito foda"
            autoComplete="current-password" required />
          <button
            className="login-button"
            type="submit"
            disabled={connecting}>
            {connecting ? "Conectando..." : "Entrar no chat"}
            {!connecting && <img src={imgOi} alt="" />}
          </button>
        </form>
        {error && <div className="login-error" role="alert">{error}</div>}
        <p className="auth-switch">
          Nao fez conta ainda bobão?
          <button type="button" onClick={onGoToRegister}>
            Cadastra ai
          </button>
        </p>
      </div>
    </div>
  );
}
