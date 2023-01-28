import { WebSocketServer } from "ws";
import express from "express";
import { Server } from "http";
import path from "path";
import { __dirname, generarId } from "./helpers.js";

const PORT = 3000

const app = express()
const server = Server(app)
const socketServer = new WebSocketServer({
    server: server
})

let clientes = []

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
    clientes = clientes.filter((_cliente) => {
        return _cliente.id != cliente.id
    })

    clientes.forEach((_cliente) => {
        _cliente.send(`${cliente.id} ha abandonado el chat`)
    })
}

socketServer.on('connection', (cliente) => {
    cliente = registrarNuevoCliente(cliente)

    cliente.on("message", manejarMensajesNuevosDe(cliente))

    cliente.on("close", retirarCliente)
})

app.use(express.static(path.join(__dirname, "./public")))
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})