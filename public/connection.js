const PORT = 3000
const socket = new WebSocket(`ws://localhost:${PORT}`)

const cajaMensajes = document.getElementById("messages")
const mensajeNuevo = document.getElementById("new-message")
const botonEnviar = document.getElementById("send-message")

function enviarMensaje() {
    const mensaje = mensajeNuevo.value

    socket.send(mensaje)

    mensajeNuevo.value = ""
    renderizarMensaje(`Tú: ${mensaje}`)
}

function renderizarMensaje(mensaje) {
    cajaMensajes.value += `${mensaje}\n`
}

botonEnviar.addEventListener("click", enviarMensaje)
mensajeNuevo.addEventListener("keyup", (evt) => {
    const key = evt.code

    if (key == "Enter") {
        enviarMensaje()
    }
})

socket.addEventListener("open", () => {
    botonEnviar.disabled = false
})

socket.addEventListener("message", (evt) => {
    renderizarMensaje(evt.data)
})

socket.addEventListener("close", () => {
    renderizarMensaje("Has abandonado la conversación")
    botonEnviar.disabled = true
})