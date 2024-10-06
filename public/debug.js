
class Debug {
    /**
     * Registra un mensaje de log con el nivel especificado y los datos asociados.
     * 
     * @param {("debug" | "info" | "warn" | "error" | "fatal")} level - El nivel de log a registrar (ej: "info", "error").
     * @param {("webServer" | "webClient" | "react" | "database" | "websocket" | "DebugWebsocket" | "api" | "bundler" | "server")} source - La fuente que genera el log.
     * @param {...any} data - Los datos adicionales que se registrarán en el log.
    */
    static log(level, source, ...data) {
        const logEntry = {
            level,
            source,
            timestamp: new Date().toLocaleString(),
            message: data,
            format: "log"
        };
        this.printLog(logEntry);
    }

    static printLog({ timestamp, source, level, message }) {
        const sourceStyle = Debug.getSourceStyle(source);
        const levelStyle = Debug.getLevelStyle(level);

        console.log(
            `%c[%c${source}%c/%c${level.toUpperCase()}%c] %c:`,
            "color: inherit",
            sourceStyle,
            "color: inherit",
            levelStyle,
            "color: inherit",
            "color: inherit",
            ...message
        );
    }

    static getSourceStyle(source) {
        const sourceColorMap = {
            webServer: "color: yellow",
            webClient: "color: lightyellow",
            react: "color: lightcyan",
            database: "color: green",
            websocket: "color: magenta",
            DebugWebsocket: "color: lightyellow",
            api: "color: cyan",
            bundler: "color: blue",
            server: "color: lightcoral"
        };
        return sourceColorMap[source] || "color: inherit";
    }

    static getLevelStyle(level) {
        const levelColorMap = {
            debug: "color: yellow",
            info: "color: green",
            warn: "color: lightyellow",
            error: "color: red",
            fatal: "color: lightcoral"
        };
        return levelColorMap[level] || "color: inherit";
    }
}

const fileHashes = {};

function connect() {
    const ws = new WebSocket("ws://localhost:3131")

    ws.onopen = () => {
        ws.send("ws debug connected");
        debug.log("info", "DebugWebsocket", `Connection opened.`)
    }

    ws.onmessage = ({ data: message }) => {
        const msg = JSON.parse(message);
        const filePath = msg.file;
        const newHash = msg.hash;

        if (msg.type === "change") {
            const previousHash = fileHashes[filePath];

            if (previousHash === newHash) {
                debug.log("info", "DebugWebsocket", `No changes detected in ${filePath}. Skipping reload.`);
                return;
            }

            fileHashes[filePath] = newHash;
            setTimeout(() => {
                reloadResource(filePath, newHash);
            }, 600);
        }
    };

    ws.onclose = (e) => {
        //debug.log("info", "DebugWebsocket", `Connection closed.`)
    }
}

function reloadResource(filePath, hash) {
    if (!hash) {
        debug.log("error", "webClient", `No hash provided for ${filePath}`);
        return;
    }

    // Detectar la extensión del archivo
    const extension = filePath.split('.').pop();

    if (['js', 'tsx'].includes(extension)) {
        reloadJavaScriptModule(filePath, hash);
    } else if (extension === 'css') {
        reloadCSS(filePath, hash);
    } else {
        debug.log("info", "webClient", `Cannot reload file type: .${extension}`);
        return;
    }
}

function reloadJavaScriptModule(filePath, hash) {
    const modulePath = `${filePath}?hash=${hash}`;

    debug.log("info", "DebugWebsocket", `Reloading JavaScript module: ${filePath}`);

    if (filePath.includes('hydrate.js')) {
        debug.log("info", "DebugWebsocket", `hydrate.js updated. Reloading the page...`);
        location.reload();
    } else {
        globalThis.doHydrate(modulePath);
    }
}

function reloadCSS(originalHref, newHref) {
    const links = document.getElementsByTagName('link');
    let found = false;

    for (let link of links) {
        if (link.href.includes(originalHref)) {
            link.href = newHref;
            found = true;
            debug.log("debug", "webClient", `Hoja de estilo recargada: ${originalHref}`)
            break;
        }
    }

    if (!found) {
        debug.log("debug", "webClient", `Hoja de estilo no encontrada: ${originalHref}`)

    }
}

function reloadImage(originalSrc, newSrc) {
    const images = document.getElementsByTagName('img');
    let found = false;

    for (let img of images) {
        if (img.src.includes(originalSrc)) {
            img.src = newSrc;
            found = true;
            console.log(`Imagen recargada: ${originalSrc}`);
            break;
        }
    }

    if (!found) {
        console.log(`Imagen no encontrada: ${originalSrc}`);
    }
}

globalThis.debug = Debug;
connect();
