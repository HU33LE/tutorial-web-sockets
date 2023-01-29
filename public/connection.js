import { CONECTAR, DESCONECTAR, ENVIAR_MENSAJE, ESTABLECER_USERNAME, CAMBIAR_CANAL, Mensaje } from "./messages.js"

const PORT = 3000
const socket = new WebSocket(`ws://localhost:${PORT}`)

let estaConectado = false

const cajaMensajes = document.getElementById("message-box")
const mensajeNuevo = document.getElementById("new-message")
const botonEnviar  = document.getElementById("send-message")
const botonConexion = document.getElementById("toggle-connection")
const username = document.getElementById("usuario")
const contenedorNuevoMensaje = document.getElementById("new-message-container")
const canales = document.getElementById("rooms")

function enviarMensaje() {
    if (!estaConectado || mensajeNuevo.value == "") {
        return
    }

    const contenido = mensajeNuevo.value
    const mensaje = new Mensaje()
    mensaje.accion = ENVIAR_MENSAJE
    mensaje.data = contenido

    socket.send(mensaje.toString())

    mensajeNuevo.value = ""
    renderizarMensaje(`${contenido}`, 'self')
}

function renderizarMensaje(mensaje, className) {
    const p = document.createElement('p');
    const div = document.createElement('div');
    p.innerText = mensaje;
    div.appendChild(p);
    div.classList.add(className,'message');
    cajaMensajes.appendChild(div);
}

function eliminarMensajes() {
    let child = cajaMensajes.firstChild
    while(child != undefined) {
        child.remove()
        child = cajaMensajes.firstChild
    }
}

function generarUsername() {
    const aleatorio = Math.floor(Math.random() * 10000);

    username.value = `Anónimo-${aleatorio}`
}

function cambiarUsername() {
    const nuevoUsername = username.value

    if (!estaConectado || nuevoUsername == "") {
        return
    }

    let mensaje = new Mensaje()

    mensaje.accion = ESTABLECER_USERNAME
    mensaje.data = nuevoUsername

    socket.send(mensaje.toString())
}

function cambiarCanal() {
    if(!estaConectado) {
        return
    }

    let mensaje = new Mensaje()

    if (canales.value == "") {
        return
    }

    mensaje.canal = canales.value
    mensaje.accion = CAMBIAR_CANAL

    eliminarMensajes()
    renderizarMensaje(`Te has unido al canal "${mensaje.canal}"`, 'info')

    socket.send(mensaje.toString())
}

function manejarConexion() {
    let mensaje = new Mensaje()

    if (estaConectado) {
        mensaje.accion = DESCONECTAR

        renderizarMensaje("Has abandonado la conversación", 'info')

        botonEnviar.disabled = true
        mensajeNuevo.disabled = true

        botonEnviar.title = "Primero debe conectarse"
        mensajeNuevo.title = "Primero debe conectarse"
        mensajeNuevo.value = ""

        contenedorNuevoMensaje.classList.add("disabled")

        botonConexion.textContent = "Conectarse"
        canales.classList.remove("connected")
    } else {
        mensaje.accion = CONECTAR

        if (username.value == "") {
            return
        }

        if (canales.value == "") {
            return
        }

        mensaje.data = username.value
        mensaje.canal = canales.value

        eliminarMensajes()
        renderizarMensaje(`Te has unido al canal ${mensaje.canal}`, 'info')

        botonEnviar.disabled = false
        mensajeNuevo.disabled = false

        botonEnviar.title = ""
        mensajeNuevo.title = ""

        contenedorNuevoMensaje.classList.remove("disabled")

        botonConexion.textContent = "Desconectarse"
        canales.classList.add("connected")
    }

    estaConectado = !estaConectado

    socket.send(mensaje.toString())
}

botonEnviar.addEventListener("click", enviarMensaje)
mensajeNuevo.addEventListener("keyup", (evt) => {
    const key = evt.code

    if (key == "Enter") {
        enviarMensaje()
    }
})

username.addEventListener("blur", cambiarUsername)

botonConexion.addEventListener("click", manejarConexion)

canales.addEventListener("change", cambiarCanal)

socket.addEventListener("message", (evt) => {
    const mensaje = new Mensaje(evt.data)
    renderizarMensaje(mensaje.data, 'other')
})

generarUsername()