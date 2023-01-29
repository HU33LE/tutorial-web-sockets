export const CONECTAR            = 0
export const DESCONECTAR         = 1
export const ENVIAR_MENSAJE      = 2
export const ESTABLECER_USERNAME = 3
export const CAMBIAR_CANAL       = 4
export const ERROR               = -1

export class Mensaje {
    accion;
    data = "";
    canal = "";

    constructor(data = "{}") {
        let obj = JSON.parse(data)
        this.accion = obj.accion
        this.data = obj.data
        this.canal = obj.canal
    }

    toString() {
        return JSON.stringify(this)
    }

    realizarAccion(accion) {
        return this.accion == accion
    }
}