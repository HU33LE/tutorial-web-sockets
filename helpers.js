import path from "path";
import { fileURLToPath } from 'url';
import crypto from "crypto";

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

export function generarId() {
    const aleatorio = Math.floor(Math.random * 1000000)
    const semilla = Date.now()

    return crypto.createHash("sha256").update(`${semilla}${aleatorio}`).digest("hex")
}