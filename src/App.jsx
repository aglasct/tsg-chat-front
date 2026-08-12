import React, { Component, useCallback, useState } from "react";
import LoginScreen from "./screens/LoginScreen";
import MainScreen from "./screens/MainScreen";
import RegisterScreen from "./screens/RegisterScreen";

export default function App() {
  const [screen, setScreen] = useState("login");
  const [session, setSession] = useState(null);
  const logout = useCallback(() => {
    setSession(null);
    setScreen("login");
  }, []);

  if (screen === "register") {
    return (
      <RegisterScreen
        onGoToLogin={() => setScreen("login")}
        onRegistered={(username) => {
          setSession({ username });
          setScreen("login");
        }}
      />
    );
  }

  if (screen === "main" && session?.socket) {
    return (
      <MainScreen
        username={session.username}
        socket={session.socket}
        onLogout={logout}
      />
    );
  }

  return (
    <LoginScreen
      initialUsername={session?.username || ""}
      onGoToRegister={() => setScreen("register")}
      onLogin={(username, socket) => {
        setSession({ username, socket });
        setScreen("main");
      }}
    />
  );
}

export class AppErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="login-page">
          <div className="login-card runtime-error">
            <h1>Não foi possível abrir esta tela</h1>
            <p>{this.state.error.message}</p>
            <button className="login-button" type="button" onClick={() => window.location.reload()}>
              Recarregar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
