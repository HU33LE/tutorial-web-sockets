import path from "path";
import { WebSocketServer } from "ws";
import express from "express";
import { Server } from "http";
import { __dirname, generarId } from "./helpers.js";
import { CAMBIAR_CANAL, CONECTAR, DESCONECTAR, ENVIAR_MENSAJE, ERROR, ESTABLECER_USERNAME, Mensaje } from "./public/messages.js"

const PORT = 3000

const app = express()
const server = Server(app)
const socketServer = new WebSocketServer({
    server: server
})

const canales = {
    "Canal 1": [],
    "Canal 2": [],
    "Canal 3": [],
    "Canal 4": [],
}

function registrarNuevoCliente(cliente) {
    cliente.id = generarId()
    cliente.estaConectado = false
    cliente.canal = ""
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

    if (cliente.canal == "") {
        let mensaje = new Mensaje()
        mensaje.accion = ERROR
        mensaje.data = "El canal es incorrecto"
        cliente.send(mensaje.toString())
        return
    }

    const canal = canales[cliente.canal]

    canal.filter((_cliente) => {
        return _cliente.id != cliente.id
    }).forEach((_cliente) => {
        let mensaje = new Mensaje() 
        mensaje.accion = ENVIAR_MENSAJE
        mensaje.data = `${cliente.username}: ${contenido}`
        _cliente.send(mensaje.toString())
    })
}

function conectarCliente(cliente, nuevoCanal) {
    if (cliente.username == undefined) {
        let mensaje = new Mensaje() 
        mensaje.accion = ERROR
        mensaje.data = "El username es obligatorio para conectarse"
        cliente.send(mensaje)
        return
    }

    if (canales[nuevoCanal] == undefined) {
        let mensaje = new Mensaje() 
        mensaje.accion = ERROR
        mensaje.data = "El canal solicitado no existe"
        cliente.send(mensaje)
        return
    }

    desconectarCliente(cliente)
    
    cliente.estaConectado = true
    cliente.canal = nuevoCanal

    let canal = canales[nuevoCanal]

    canal.forEach((_cliente) => {
        let mensaje = new Mensaje() 
        mensaje.accion = ENVIAR_MENSAJE
        mensaje.data = `El usuario ${cliente.username} se ha conectado`
        _cliente.send(mensaje.toString())
    })
    canal.push(cliente)

    canales[nuevoCanal] = canal
}

function desconectarCliente(cliente) {
    if (cliente.canal == "") {
        return
    }

    let canal = canales[cliente.canal]

    canal = canal.filter((_cliente) => {
        return _cliente.id != cliente.id
    })

    if (cliente.estaConectado) {
        canal.forEach((_cliente) => {
            let mensaje = new Mensaje() 
            mensaje.accion = ENVIAR_MENSAJE
            mensaje.data = `${cliente.username} ha abandonado el chat`
            _cliente.send(mensaje.toString())
        })
    }

    canales[cliente.canal] = canal

    cliente.estaConectado = false
}

function establecerUsername(cliente, username) {
    if (cliente.estaConectado) {
        if (cliente.canal == "") {
            return
        }

        const canal = canales[cliente.canal]

        canal.filter((_cliente) => {
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
            conectarCliente(cliente, mensaje.canal)
            return
        }

        if (mensaje.realizarAccion(CAMBIAR_CANAL)) {
            conectarCliente(cliente, mensaje.canal)
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
            return
        }
    }
}

socketServer.on('connection', (cliente) => {
    cliente = registrarNuevoCliente(cliente)

    cliente.on("message", manejarMensajesNuevosDe(cliente))

    cliente.on("close", () => {
        desconectarCliente(cliente)
    })
})

app.use(express.static(path.join(__dirname, "./public")))
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})