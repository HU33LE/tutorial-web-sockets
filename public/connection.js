import { CONECTAR, DESCONECTAR, ENVIAR_MENSAJE, ESTABLECER_USERNAME, Mensaje } from "./messages.js"

const PORT = 3000
const socket = new WebSocket(`ws://localhost:${PORT}`)

let estaConectado = false

const cajaMensajes = document.getElementById("messages")
const mensajeNuevo = document.getElementById("new-message")
const botonEnviar  = document.getElementById("send-message")
const botonConexion = document.getElementById("toggle-connection")
const messageBox = document.getElementById("message-box")
const username = document.getElementById("usuario")

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
    cajaMensajes.value += `${mensaje}\n`;
    const p = document.createElement('p');
    const div = document.createElement('div');
    p.innerText = mensaje;
    div.appendChild(p);
    div.classList.add(className,'message');
    messageBox.appendChild(div);
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

function manejarConexion() {
    let mensaje = new Mensaje()

    if (estaConectado) {
        mensaje.accion = DESCONECTAR

        renderizarMensaje("Has abandonado la conversación", 'info')
        botonEnviar.disabled = true
        botonConexion.textContent = "Conectarse"
        username.classList.remove("connected")
    } else {
        if (username.value == "") {
            return
        }

        mensaje.accion = CONECTAR
        mensaje.data = username.value

        botonEnviar.disabled = false
        botonConexion.textContent = "Desconectarse"
        username.classList.add("connected")
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

socket.addEventListener("message", (evt) => {
    const mensaje = new Mensaje(evt.data)
    renderizarMensaje(mensaje.data, 'other')
})

generarUsername()