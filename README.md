# NovaChat

Frontend React do NovaChat, conectado a um backend Go via WebSocket.

## Rodar

```bash
npm install
npm run dev
```

Por padrão, o frontend conecta em:

```text
ws://localhost:8080/ws
```

Para alterar:

```env
VITE_WS_URL=ws://localhost:8080/ws
```

## Fluxo

Ao informar o nome, o frontend abre o WebSocket. Depois que `onopen` dispara, envia:

```json
{
  "type": "login",
  "username": "Douglas"
}
```

Mensagens:

```json
{
  "type": "message",
  "text": "Olá!"
}
```

O frontend não adiciona a mensagem localmente. Ele aguarda o broadcast enviado pelo backend.
