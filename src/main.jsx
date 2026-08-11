import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Hash, Users, MoreVertical, Plus, Paperclip, Smile, Send,
  Settings, Wifi, WifiOff, Zap, X
} from "lucide-react";
import "./styles.css";
import logo from './assets/icon.gif';
import img_oi from './assets/oi.png';
import EmojiPicker, { Theme } from 'emoji-picker-react';

const DEFAULT_WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080/ws";

const initialMessages = [
  { id: 1, author: "Ag", color: "purple", text: "muehehehehe", time: "99:99" },
];

const colors = ["purple", "violet", "blue", "pink"];

function Icon() {
  return <img src={logo} alt="Icon" style={{ maxWidth: '50px' }} />;
}

function App() {
  const [username, setUsername] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [text, setText] = useState("");
  const [wsUrl, setWsUrl] = useState(DEFAULT_WS_URL);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showConnection, setShowConnection] = useState(false);
  const wsRef = useRef(null);
  const bottomRef = useRef(null);

  const [mostrarPicker, setMostrarPicker] = useState(false);
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => wsRef.current?.close();
  }, []);

  const aoClicarNoEmoji = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
    // Opcional: descomente a linha abaixo se quiser fechar o seletor após clicar
    setMostrarPicker(false); 
  };

  const connectWebSocket = (name) => {

    console.log("CONNECT WEBSOCKET CHAMADO");
    console.log("VITE_WS_URL:", import.meta.env.VITE_WS_URL);
    console.log("wsUrl:", wsUrl);

    return new Promise((resolve, reject) => {
      let settled = false;
      

      const socket = new WebSocket(wsUrl);

      wsRef.current = socket;

      socket.onopen = () => {
        socket.send(JSON.stringify({
          type: "login",
          username: name
        }));

        setConnected(true);
        setConnecting(false);
        if (!settled) {
          settled = true;
          resolve();
        }
      };

      socket.onmessage = (event) => {
        let data;

        try {
          data = JSON.parse(event.data);
        } catch {
          console.error("Mensagem inválida recebida:", event.data);
          return;
        }

        switch (data.type) {
          case "message":
            setMessages((current) => [
              ...current,
              {
                id: crypto.randomUUID(),
                author: data.author || "Servidor",
                color: data.author === username ? "violet" : colors[data.author?.length % colors.length || 0],
                own: data.author === username,
                text: data.text || "",
                time: data.time || new Date().toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              },
            ]);
            break;

          case "users":
            setOnlineUsers(data.users || []);
            break;

          case "system":
            console.log(data.text);
            break;

          case "error":
            setLoginError(data.text || "Erro no servidor");
            if (!settled) {
              settled = true;
              reject(new Error(data.text || "Erro no servidor"));
            }
            break;

          default:
            console.log("Evento WebSocket desconhecido:", data);
        }
      };

      socket.onerror = () => {
        setConnected(false);
        setConnecting(false);
        if (!settled) {
          settled = true;
          reject(new Error("Não foi possível conectar ao WebSocket"));
        }
      };

      socket.onclose = () => {
        setConnected(false);
        setConnecting(false);
        wsRef.current = null;
        setLoggedIn(false);
        setOnlineUsers([]);
      };
    });
  };

  const login = async () => {
    console.log("LOGIN CHAMADO");

    const name = username.trim();

    console.log("name:", name);
    console.log("connecting:", connecting);

    if (!name || connecting) return;

    setLoginError("");
    setConnecting(true);

    try {
      await connectWebSocket(name);
      setLoggedIn(true);
    } catch (error) {
      setLoginError(error.message);
      wsRef.current?.close();
    }
  };

  const disconnect = () => {
    wsRef.current?.close();
    wsRef.current = null;
    setShowConnection(false);
    setConnected(false);
    setLoggedIn(false);
    setOnlineUsers([]);
  };

  const sendMessage = () => {
    const value = text.trim();

    if (!value) return;

    if (wsRef.current?.readyState !== WebSocket.OPEN) {
      setLoginError("O WebSocket não está conectado");
      return;
    }

    wsRef.current.send(JSON.stringify({
      type: "message",
      text: value
    }));

    setText("");
  };

  const onKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  if (!loggedIn) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-brand">
            <div className="brand-icon">{Icon()}</div>
            <span>TsgChat</span>
          </div>

          <div className="login-heading">
            <h1>OIIIIII</h1>
            <p>Digita seu nick ai em baixo :)</p>
          </div>

          <form onSubmit={(event) => { event.preventDefault(); login(); }}>
            <label htmlFor="username">SEU NICK</label>
            <input
              id="username"
              className="login-input"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Ex: Abacate"
              autoFocus
            />

            <button
              className="login-button"
              type="submit"
              disabled={!username.trim() || connecting}
            >
              {connecting ? "Conectando..." : "Entrar no chat"}
              {!connecting && <img src={img_oi} alt="Icon" style={{ maxWidth: '25px' }}/>}
            </button>
          </form>

          {loginError && <div className="login-error">{loginError}</div>}
          {/*
          <div className="login-note">
            <span className="status-dot" />
            Sem autenticação por enquanto
          </div>*/}
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">{Icon()}</div>
          <span>TSG</span>
        </div>

        <section className="side-section">
          <div className="section-label">CONEXÃO</div>
          <button
            className={`connection-status ${connected ? "online" : "offline"}`}
            onClick={() => setShowConnection(true)}
          >
            <span className="status-dot" />
            {connected ? "Conectado" : "Desconectado"}
          </button>
        </section>

        <section className="side-section channels">
          <div className="section-heading">
            <span className="section-label">CANAIS</span>
          </div>

          {["geral", "flood", "fofocas", "sem-contexto"].map((channel, index) => (
            <button className={`channel ${index === 0 ? "active" : ""}`} key={channel}>
              <Hash size={20} />
              <span>{channel}</span>
            </button>
          ))}
        </section>

        <section className="side-section online-users">
          <div className="section-label">USUÁRIOS ONLINE</div>

          <div className="online-users-list">
          {(onlineUsers.length ? onlineUsers : [username]).map((user, index) => {
            const name = typeof user === "string" ? user : user.username;

            return (
              <div className="user-row" key={`${name}-${index}`}>
                <Avatar name={name} color={name === username ? "violet" : colors[index % colors.length]} />
                <span>{name}</span>
                {name === username && <span className="crown">Você</span>}
              </div>
            );
          })}
          </div>
        </section>

        <div className="profile">
          <Avatar name={username} color="violet" />
          <div className="profile-info">
            <strong>{username}</strong>
            <span><i /> Online</span>
          </div>
          <button className="icon-button" onClick={disconnect}><Settings size={19} /></button>
        </div>
      </aside>

      <main className="chat">
        <header className="chat-header">
          <div>
            <div className="channel-title"><Hash size={28} /> <h1>geral</h1></div>
            <p>Chat geral para todos os membros.</p>
          </div>

          <div className="header-actions">
            <div className="member-count">
              <Users size={20} /> {onlineUsers.length || 0} online
            </div>
            <button className="icon-button"><MoreVertical /></button>
          </div>
        </header>

        <div className="messages">
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="composer-wrap">
          <div className="composer">
            <button className="composer-icon"><Paperclip size={23} /></button>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Digite sua mensagem..."
            />
            {/* O SEU BOTÃO: Agora com evento de clique para abrir o seletor */}
            <button 
              className="composer-icon" onClick={() => setMostrarPicker(!mostrarPicker)} type="button"><Smile size={23} />
            </button>
          </div>

          <button className="send-button" onClick={sendMessage} aria-label="Enviar">
            <Send size={22} />
          </button>
        </div>
      </main>

      {/* Janela flutuante dos emojis posicionada de forma absoluta */}
      {mostrarPicker && (
        <div style={{ position: 'absolute', bottom: '50px', right: '0', zIndex: 1000 }}>
          <EmojiPicker theme={Theme.DARK} onEmojiClick={aoClicarNoEmoji} />
        </div>
      )}

      {showConnection && (
        <div className="modal-backdrop" onMouseDown={() => setShowConnection(false)}>
          <div className="connection-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-title">
              <div>
                <h2>Perfil</h2>
                <p>Configure seu perfil</p>
              </div>
              <button className="icon-button" onClick={() => setShowConnection(false)}><X /></button>
            </div>
          {/*}
            <label>ENDEREÇO DO SERVIDOR</label>
            <input
              className="ws-input"
              value={wsUrl}
              onChange={(e) => setWsUrl(e.target.value)}
              placeholder="ws://localhost:8080/ws"
            />*/}

            <div className="modal-status">
              {connected ? <Wifi size={18} /> : <WifiOff size={18} />}
              <span>{connected ? "Conexão ativa" : "Sem conexão"}</span>
            </div>

            <div className="modal-actions">
              <button className="secondary-button" onClick={disconnect}>Desconectar</button>
              {/*<button
                className="primary-button"
                onClick={() => {
                  if (connected) {
                    setShowConnection(false);
                    return;
                  }
                  setShowConnection(false);
                  login();
                }}
              >
                Conectar
              </button>*/}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Avatar({ name, color }) {
  return <div className={`avatar ${color}`}>{name?.[0]?.toUpperCase() || "?"}</div>;
}

function Message({ message }) {
  return (
    <article className="message">
      <Avatar name={message.author} color={message.color} />

      <div className="message-content">
        <div className="message-meta">
          <strong className={message.color}>{message.author}</strong>
          {message.own && <span className="you-badge">Você</span>}
          <time>{message.time}</time>
        </div>
        <p>{message.text}</p>
      </div>
    </article>
  );
}

createRoot(document.getElementById("root")).render(<App />);
