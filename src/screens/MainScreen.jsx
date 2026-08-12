import React, { useEffect, useRef, useState } from "react";
import { Hash, MoreVertical, Paperclip, Send, Settings, Smile, Users, Wifi, X } from "lucide-react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import logo from "../assets/icon.gif";

const colors = ["purple", "violet", "blue", "pink"];

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

export default function MainScreen({ username, socket, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [text, setText] = useState("");
  const [connected, setConnected] = useState(socket.readyState === WebSocket.OPEN);
  const [showConnection, setShowConnection] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    const handleMessage = (event) => {
      let data;
      try { data = JSON.parse(event.data); } catch { return; }
      if (data.type === "message") {
        setMessages((current) => [...current, {
          id: crypto.randomUUID(),
          author: data.author || "Servidor",
          color: data.author === username ? "violet" : colors[data.author?.length % colors.length || 0],
          own: data.author === username,
          text: data.text || "",
          time: data.time || new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        }]);
      } else if (data.type === "users") {
        setOnlineUsers(data.users || []);
      }
    };
    const handleClose = () => { setConnected(false); onLogout(); };
    socket.addEventListener("message", handleMessage);
    socket.addEventListener("close", handleClose);
    setConnected(socket.readyState === WebSocket.OPEN);
    return () => {
      socket.removeEventListener("message", handleMessage);
      socket.removeEventListener("close", handleClose);
    };
  }, [onLogout, socket, username]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const disconnect = () => {
    socket.close();
  };

  const sendMessage = () => {
    const value = text.trim();
    if (!value || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ type: "message", text: value }));
    setText("");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-icon"><img src={logo} alt="TsgChat" /></div><span>TSG</span></div>
        <section className="side-section">
          <div className="section-label">CONEXÃO</div>
          <button className={`connection-status ${connected ? "online" : "offline"}`} onClick={() => setShowConnection(true)}><span className="status-dot" />{connected ? "Conectado" : "Desconectado"}</button>
        </section>
        <section className="side-section channels">
          <div className="section-heading"><span className="section-label">CANAIS</span></div>
          {["geral", "flood", "fofocas", "sem-contexto"].map((channel, index) => <button className={`channel ${index === 0 ? "active" : ""}`} key={channel}><Hash size={20} /><span>{channel}</span></button>)}
        </section>
        <section className="side-section online-users">
          <div className="section-label">USUÁRIOS ONLINE</div>
          <div className="online-users-list">{(onlineUsers.length ? onlineUsers : [username]).map((user, index) => {
            const name = typeof user === "string" ? user : user.username;
            return <div className="user-row" key={`${name}-${index}`}><Avatar name={name} color={name === username ? "violet" : colors[index % colors.length]} /><span>{name}</span>{name === username && <span className="crown">Você</span>}</div>;
          })}</div>
        </section>
        <div className="profile"><Avatar name={username} color="violet" /><div className="profile-info"><strong>{username}</strong><span><i /> Online</span></div><button className="icon-button" onClick={() => setShowConnection(true)} aria-label="Abrir perfil"><Settings size={19} /></button></div>
      </aside>
      <main className="chat">
        <header className="chat-header"><div><div className="channel-title"><Hash size={28} /><h1>geral</h1></div><p>Chat geral para todos os membros.</p></div><div className="header-actions"><div className="member-count"><Users size={20} /> {onlineUsers.length} online</div><button className="icon-button" aria-label="Mais opções"><MoreVertical /></button></div></header>
        <div className="messages">{messages.map((message) => <Message key={message.id} message={message} />)}<div ref={bottomRef} /></div>
        <div className="composer-wrap"><div className="composer"><button className="composer-icon" aria-label="Anexar arquivo"><Paperclip size={23} /></button><input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} placeholder="Digite sua mensagem..." /><button className="composer-icon" onClick={() => setShowEmojiPicker((value) => !value)} aria-label="Escolher emoji"><Smile size={23} /></button></div><button className="send-button" onClick={sendMessage} aria-label="Enviar"><Send size={22} /></button></div>
      </main>
      {showEmojiPicker && <div className="emoji-picker"><EmojiPicker theme={Theme.DARK} onEmojiClick={(emoji) => { setText((value) => value + emoji.emoji); setShowEmojiPicker(false); }} /></div>}
      {showConnection && <div className="modal-backdrop" onMouseDown={() => setShowConnection(false)}><div className="connection-modal" onMouseDown={(e) => e.stopPropagation()}><div className="modal-title"><div><h2>Perfil</h2><p>Configure seu perfil</p></div><button className="icon-button" onClick={() => setShowConnection(false)} aria-label="Fechar"><X /></button></div><div className="modal-status"><Wifi size={18} /><span>Conexão ativa</span></div><div className="modal-actions"><button className="secondary-button" onClick={disconnect}>Desconectar</button></div></div></div>}
    </div>
  );
}
