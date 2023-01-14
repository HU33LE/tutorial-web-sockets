import path from "path";
import { WebSocketServer } from "ws";
import express from "express";
import { Server } from "http";
import { __dirname, generarId } from "./helpers.js";
import { CONECTAR, DESCONECTAR, ENVIAR_MENSAJE, ERROR, ESTABLECER_USERNAME, Mensaje } from "./public/messages.js"

const PORT = 3000

const app = express()
const server = Server(app)
const socketServer = new WebSocketServer({
    server: server
})

let clientes = []

function registrarNuevoCliente(cliente) {
    cliente.id = generarId()
    return cliente
}

function enviarMensaje(cliente, contenido) {
    if (!cliente.estaConectado) {
        let mensaje = new Mensaje() 
        mensaje.accion = ERROR
        mensaje.data = "Debe conectarse para enviar mensajes"
        cliente.send(mensaje.toString())
        return
    }

    clientes.filter((_cliente) => {
        return _cliente.id != cliente.id
    }).forEach((_cliente) => {
        let mensaje = new Mensaje() 
        mensaje.accion = ENVIAR_MENSAJE
        mensaje.data = `${cliente.username}: ${contenido}`
        _cliente.send(mensaje.toString())
    })
}

function conectarCliente(cliente) {
    if (cliente.username == undefined) {
        let mensaje = new Mensaje() 
        mensaje.accion = ERROR
        mensaje.data = "El username es obligatorio para conectarse"
        cliente.send(mensaje)
        return
    }

    cliente.estaConectado = true
    clientes.forEach((_cliente) => {
        let mensaje = new Mensaje() 
        mensaje.accion = ENVIAR_MENSAJE
        mensaje.data = `El usuario ${cliente.username} se ha conectado`
        _cliente.send(mensaje.toString())
    })
    clientes.push(cliente)
}

function desconectarCliente(cliente) {
    clientes = clientes.filter((_cliente) => {
        return _cliente.id != cliente.id
    })

    if (cliente.estaConectado) {
        clientes.forEach((_cliente) => {
            let mensaje = new Mensaje() 
            mensaje.accion = ENVIAR_MENSAJE
            mensaje.data = `${cliente.username} ha abandonado el chat`
            _cliente.send(mensaje.toString())
        })
    }

    cliente.estaConectado = false
}

function establecerUsername(cliente, username) {
    if (cliente.estaConectado) {
        clientes.filter((_cliente) => {
            return _cliente.id != cliente.id
        }).forEach((_cliente) => {
            let mensaje = new Mensaje() 
            mensaje.accion = ENVIAR_MENSAJE
            mensaje.data = `${cliente.username} ha cambiado su usuario a ${username}`
            _cliente.send(mensaje.toString())
        })
    }
    
    cliente.username = username
}

function manejarMensajesNuevosDe(cliente) {
    return (data) => {
        const mensaje = new Mensaje(data)

        if (mensaje.realizarAccion(CONECTAR)) {
            establecerUsername(cliente, mensaje.data)
            conectarCliente(cliente)
            return
        }

        if (mensaje.realizarAccion(DESCONECTAR)) {
            desconectarCliente(cliente)
            return
        }

        if (mensaje.realizarAccion(ENVIAR_MENSAJE)) {
            enviarMensaje(cliente, mensaje.data)
            return
        }

        if (mensaje.realizarAccion(ESTABLECER_USERNAME)) {
            establecerUsername(cliente, mensaje.data)
        }
    }
}

socketServer.on('connection', (cliente) => {
    cliente = registrarNuevoCliente(cliente)

    cliente.on("message", manejarMensajesNuevosDe(cliente))

    cliente.on("close", desconectarCliente)
})

app.use(express.static(path.join(__dirname, "./public")))
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})