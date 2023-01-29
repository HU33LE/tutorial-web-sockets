const PORT = 3000
const socket = new WebSocket(`ws://localhost:${PORT}`)

const cajaMensajes = document.getElementById("message-box")
const mensajeNuevo = document.getElementById("new-message")
const botonEnviar = document.getElementById("send-message")

function enviarMensaje() {
    const mensaje = mensajeNuevo.value

    socket.send(mensaje)

    mensajeNuevo.value = ""
    renderizarMensaje(`${mensaje}`, 'self')
}

function renderizarMensaje(mensaje, className) {
    const p = document.createElement('p');
    const div = document.createElement('div');
    p.innerText = mensaje;
    div.appendChild(p);
    div.classList.add(className,'message');
    cajaMensajes.appendChild(div);
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
    renderizarMensaje("Te has unido a la conversación", "info")
})

socket.addEventListener("message", (evt) => {
    renderizarMensaje(evt.data, 'other')
})

socket.addEventListener("close", () => {
    renderizarMensaje("Has abandonado la conversación", "info")
    botonEnviar.disabled = true
})