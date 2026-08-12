import React, { useState } from "react";
import Brand from "../components/Brand";
import { WS_URL } from "../config";
import imgOi from "../assets/oi.png";

export default function LoginScreen({ initialUsername, onGoToRegister, onLogin }) {
  const [username, setUsername] = useState(initialUsername);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [connecting, setConnecting] = useState(false);

  const submit = (event) => {
    event.preventDefault();
    const name = username.trim();

    if (name.length < 3) {
      setError("O usuário deve ter no mínimo 3 caracteres.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
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
          <p>Entre com seu usuário e sua senha :)</p>
        </div>
        <form onSubmit={submit}>
          <label htmlFor="login-username">SEU USUÁRIO</label>
          <input id="login-username" className="login-input" value={username} onChange={(e) => setUsername(e.target.value)} minLength={3} placeholder="Ex: Abacate" autoComplete="username" autoFocus required />
          <label htmlFor="login-password">SENHA</label>
          <input id="login-password" className="login-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} placeholder="Sua senha" autoComplete="current-password" required />
          <button className="login-button" type="submit" disabled={connecting}>
            {connecting ? "Conectando..." : "Entrar no chat"}
            {!connecting && <img src={imgOi} alt="" />}
          </button>
        </form>
        {error && <div className="login-error" role="alert">{error}</div>}
        <p className="auth-switch">Ainda não tem uma conta? <button type="button" onClick={onGoToRegister}>Cadastre-se</button></p>
      </div>
    </div>
  );
}
