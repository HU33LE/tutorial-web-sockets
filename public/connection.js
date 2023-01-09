const PORT = 3000
const socket = new WebSocket(`ws://localhost:${PORT}`)

const messagesBox = document.getElementById("messages")
const newMessage = document.getElementById("new-message")
const sendButton = document.getElementById("send-message")

function sendMessage() {
    const message = newMessage.value

    socket.send(message)

    newMessage.value = ""
    appendMessage(`Tú: ${message}`)
}

function appendMessage(message) {
    messagesBox.value += `${message}\n`
}

sendButton.addEventListener("click", sendMessage)
newMessage.addEventListener("keyup", (evt) => {
    const key = evt.code

    if (key == "Enter") {
        sendMessage()
    }
})

socket.addEventListener("open", () => {
    sendButton.disabled = false
})

socket.addEventListener("message", (evt) => {
    appendMessage(evt.data)
})

socket.addEventListener("close", () => {
    appendMessage("Has abandonado la conversación")
    sendButton.disabled = true
})