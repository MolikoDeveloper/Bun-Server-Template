import type { Serve, Server, ServerWebSocket, WebSocketHandler } from "bun";
import { join as joinPath } from "path";
import { serve } from "bun";
import { renderToReadableStream } from "react-dom/server";
import { watch, statSync } from "fs";
import { websocketHandler } from "./WebSocket";

let host: Server | null;
let debugWS: Server | null;
let restartTimer: NodeJS.Timeout | null;
const productionMode = import.meta.env.NODE_ENV === "production";

function startServer() {

    delete require.cache[require.resolve("src/common/getStatics")];
    let statics = null;

    if (!require.cache[require.resolve("src/common/getStatics")]) {
        console.log(`Adding cache for getStatics`)
        statics = require("src/common/getStatics").getFilesFromDirs(["dist", "public"]);
    }

    const PageSrcRouter = new Bun.FileSystemRouter({
        dir: "pages",
        style: 'nextjs'
    });

    const PageBuildRouter = new Bun.FileSystemRouter({
        dir: "dist/pages",
        style: "nextjs"
    });

    host = serve<{ url: URL }>({
        port: 3000,
        hostname: "localhost",
        static: statics,
        async fetch(req, server) {
            const url = new URL(req.url);
            if (server.upgrade(req, { data: { url } })) return;
            delete require.cache[require.resolve("src/App")];

            if (url.pathname.startsWith('/api/')) {
                delete require.cache[require.resolve('src/Api')];
                const { handleApiRequest } = require('src/Api');
                return await handleApiRequest(req, server);
            }

            const tspage = PageSrcRouter.match(url.pathname);
            const jspage = PageBuildRouter.match(url.pathname);

            if (!tspage || !jspage) return new Response("501");

            //initialize the app
            const App = require("src/App").default;

            let stringRender = await renderToReadableStream(
                App(url.pathname, tspage?.filePath),
                {
                    bootstrapScriptContent: `globalThis.react='/pages/${jspage?.src}'`,
                    bootstrapModules: [
                        "/src/hydrate.js",
                    ],
                    bootstrapScripts: [
                        "/debug.js",
                    ]
                }
            );

            return new Response(stringRender, { headers: { "Content-Type": "text/html" } });
        },
        websocket: websocketHandler
    });

    if (!productionMode) {
        debugWS = serve<{ url: URL }>({
            port: 3131,
            fetch(req, server) {
                const url = new URL(req.url);
                if (server.upgrade(req, { data: { url } })) return;
            },
            websocket: {
                open(ws) {
                    console.log(`[debug] Websocket opened: ${ws.data.url}`);
                    if (!productionMode) ws.subscribe("debug")
                },
                message(ws, message) {
                    console.log(`[debug] Message from client: ${message}`);
                },
                close(ws) {
                    if (!productionMode) ws.subscribe("debug")
                }
            }
        });
    }
}

function stopServer() {
    if (!host) return;

    debugWS?.stop(true);
    debugWS = null;

    // @ts-ignore
    host.stop(true);
    host = null;
}

function watchDirectories(directories: string[]) {
    if (!directories) return;

    directories.forEach((directory) => {
        const fullDir = joinPath(process.cwd(), directory);
        if (!statSync(fullDir).isDirectory()) return;

        watch(
            fullDir,
            { recursive: true },
            (eventType, filename) => {
                console.log(`${eventType}: ${filename}`);
                if (!productionMode) {
                    debugWS?.publish("debug", JSON.stringify({
                        type: eventType,
                        file: filename
                    }));
                }

                if (restartTimer) clearTimeout(restartTimer);

                // @ts-ignore
                restartTimer = setTimeout(() => {
                    stopServer();
                    startServer();
                }, 500);

            }
        );
    });
}

startServer();
watchDirectories(["dist", "src", "pages", "public"]);
