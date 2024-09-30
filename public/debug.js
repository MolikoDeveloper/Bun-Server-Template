function connect() {
    const ws = new WebSocket("ws://localhost:3131")

    ws.onopen = () => {
        ws.send("ws debug connected");
    }

    ws.onmessage = ({ data: message }) => {
        console.log(message)
        const msg = JSON.parse(message);

        if (msg.type == "change") {
            console.log("Reloading...");
            setTimeout(() => {
                location.reload();
            }, 600);
        }
    }

    ws.onclose = (e) => {
        console.log("Connection closed.")
    }
}
connect();
