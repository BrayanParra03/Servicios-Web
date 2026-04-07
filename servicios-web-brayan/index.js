const express = require('express');
const fs = require('fs');

const app = express();
app.use(express.json());

// 🔐 API KEY
const API_KEY = "123456";

// 🔐 Middleware de seguridad
const verificarApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (apiKey !== API_KEY) {
        return res.status(403).json({
            mensaje: 'Acceso denegado: API Key inválida'
        });
    }

    next();
};

// 🏠 Ruta principal
app.get('/', (req, res) => {
    res.json({ mensaje: 'API funcionando correctamente 🚀' });
});

// 🔹 GET usuarios
app.get('/usuarios', verificarApiKey, (req, res) => {
    const data = fs.readFileSync('usuarios.json');
    const usuarios = JSON.parse(data);
    res.json(usuarios);
});

// 🔹 POST crear usuario
app.post('/usuarios', verificarApiKey, (req, res) => {
    const nuevoUsuario = req.body;

    const data = fs.readFileSync('usuarios.json');
    const usuarios = JSON.parse(data);

    nuevoUsuario.id = usuarios.length + 1;

    usuarios.push(nuevoUsuario);

    fs.writeFileSync('usuarios.json', JSON.stringify(usuarios, null, 2));

    res.json({
        mensaje: 'Usuario creado correctamente',
        usuario: nuevoUsuario
    });
});

// 🔹 PUT editar usuario
app.put('/usuarios/:id', verificarApiKey, (req, res) => {
    const id = parseInt(req.params.id);
    const datosActualizados = req.body;

    const data = fs.readFileSync('usuarios.json');
    let usuarios = JSON.parse(data);

    const index = usuarios.findIndex(u => u.id === id);

    if (index === -1) {
        return res.status(404).json({
            mensaje: 'Usuario no encontrado'
        });
    }

    usuarios[index] = { ...usuarios[index], ...datosActualizados };

    fs.writeFileSync('usuarios.json', JSON.stringify(usuarios, null, 2));

    res.json({
        mensaje: 'Usuario actualizado',
        usuario: usuarios[index]
    });
});

// 🔹 DELETE eliminar usuario
app.delete('/usuarios/:id', verificarApiKey, (req, res) => {
    const id = parseInt(req.params.id);

    const data = fs.readFileSync('usuarios.json');
    let usuarios = JSON.parse(data);

    const nuevosUsuarios = usuarios.filter(u => u.id !== id);

    if (usuarios.length === nuevosUsuarios.length) {
        return res.status(404).json({
            mensaje: 'Usuario no encontrado'
        });
    }

    fs.writeFileSync('usuarios.json', JSON.stringify(nuevosUsuarios, null, 2));

    res.json({
        mensaje: 'Usuario eliminado correctamente'
    });
});

// ⚠ Manejo de errores global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        mensaje: 'Error interno del servidor'
    });
});

// 🚀 Servidor
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});