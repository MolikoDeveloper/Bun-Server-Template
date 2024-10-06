
import type { WebSocketHandler } from "bun";

export const websocketHandler: WebSocketHandler<{ url: URL }> = {
    open(ws) {
        console.log(`WebSocket opened: ${ws.data.url}`);
        ws.subscribe("debug")

    },
    message(ws, message) {
        console.log(`Message from client: ${message}`);
        ws.publish("debug", `${message}`);
    },
    close(ws) {
        console.log(`WebSocket closed: ${ws.data.url}`);
    }
};