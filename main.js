import path from "path";
import { fileURLToPath } from 'url';
import { WebSocketServer } from "ws";
import express from "express";
import { Server } from "http";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3000

const app = express()
const server = Server(app)
const socketServer = new WebSocketServer({
    server: server
})

let clientes = []

function generarId() {
    const aleatorio = Math.floor(Math.random * 1000000)
    const semilla = Date.now()

    return crypto.createHash("sha256").update(`${semilla}${aleatorio}`).digest("hex")
}

function registrarNuevoCliente(cliente) {
    cliente.id = generarId()

    clientes.forEach((_cliente) => {
        _cliente.send(`${cliente.id} se ha unido a la conversación`)
    })

    clientes.push(cliente)

    return cliente
}

function manejarMensajesNuevosDe(cliente) {
    return (data) => {
        clientes.filter((_cliente) => {
            return _cliente.id != cliente.id
        }).forEach((_cliente) => {
            _cliente.send(`${cliente.id}: ${data}`)
        })
    }
}

function retirarCliente(cliente) {
    return () => {
        clientes = clientes.filter((_cliente) => {
            return _cliente.id != cliente.id
        })
        
        clientes.forEach((_cliente) => {
            _cliente.send(`${cliente.id} ha abandonado el chat`)
        })
    }
}

socketServer.on('connection', (cliente) => {
    cliente = registrarNuevoCliente(cliente)

    cliente.on("message", manejarMensajesNuevosDe(cliente))

    cliente.on("close", retirarCliente(cliente))
})

app.use(express.static(path.join(__dirname, "./public")))
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})