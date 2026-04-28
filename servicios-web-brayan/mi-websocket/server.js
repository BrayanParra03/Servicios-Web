const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
console.log('🚀 Servidor de Chat Multimedia iniciado en ws://localhost:8080');

const historialMensajes = [];
const LIMITE_HISTORIAL = 50; 

function emitirATodos(datos, excluirCliente = null) {
    wss.clients.forEach((cliente) => {
        if (cliente.readyState === WebSocket.OPEN && cliente !== excluirCliente) {
            cliente.send(JSON.stringify(datos));
        }
    });
}

function emitirListaUsuarios() {
    const usuarios = [];
    wss.clients.forEach((cliente) => {
        if (cliente.readyState === WebSocket.OPEN && cliente.usuario) {
            usuarios.push(cliente.usuario);
        }
    });
    emitirATodos({ tipo: 'listaUsuarios', usuarios: usuarios });
}

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const datos = JSON.parse(message);

        if (datos.tipo === 'conexion') {
            ws.usuario = datos.usuario;
            console.log(`🟢 ${ws.usuario} ha entrado al chat`);
            
            ws.send(JSON.stringify({ tipo: 'historial', mensajes: historialMensajes }));

            emitirATodos({ tipo: 'sistema', mensaje: `${ws.usuario} se ha unido al chat.` });
            emitirListaUsuarios();
        } 
        // Aceptamos tanto 'mensaje' de texto como 'archivo' (fotos/docs)
        else if (datos.tipo === 'mensaje' || datos.tipo === 'archivo') {
            datos.hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            historialMensajes.push(datos);
            if (historialMensajes.length > LIMITE_HISTORIAL) {
                historialMensajes.shift();
            }

            emitirATodos(datos); 
        }
        else if (datos.tipo === 'escribiendo') {
            emitirATodos({ tipo: 'escribiendo', usuario: ws.usuario }, ws);
        }
    });

    ws.on('close', () => {
        if (ws.usuario) {
            console.log(`🔴 ${ws.usuario} se ha desconectado`);
            emitirATodos({ tipo: 'sistema', mensaje: `${ws.usuario} ha abandonado el chat.` });
            emitirListaUsuarios();
        }
    });
});