import "src/global/debug";
import type { Server } from "bun";
import { join as joinPath } from "path";
import { serve } from "bun";
import { renderToReadableStream } from "react-dom/server";
import { watch, statSync } from "fs";
import { websocketHandler } from "../src/WebSocket";
import { getFileHash } from "src/common/getFileHash";

let host: Server | null;
let debugWS: Server | null;
let restartTimer: Timer | null;
const productionMode = import.meta.env.NODE_ENV === "production";
const fileHashes: any = {};

// start debug websocket server
if (!productionMode) {
    debug.log("debug", "DebugWebsocket", "starting server");
    debugWS = serve<{ url: URL }>({
        port: 3131,
        fetch(req, server) {
            const url = new URL(req.url);
            if (server.upgrade(req, { data: { url } })) return;
        },
        websocket: {
            open(ws) {
                debug.log("debug", "DebugWebsocket", `Connection opened: ${ws.data.url}`);
                if (!productionMode) ws.subscribe("debug")
            },
            message(ws, message) {

            },
            close(ws) {
                if (!productionMode) ws.subscribe("debug")
            }
        }
    });
}

async function startServer() {

    debug.log("debug", "server", "starting server");

    delete require.cache[require.resolve("src/common/getStatics")];
    let statics = null;

    if (!require.cache[require.resolve("src/common/getStatics")]) {
        debug.log("debug", "server", "reloading statics files");
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
        port: 3001,
        static: statics,
        async fetch(req, server) {
            debug.log("debug", "server", `fetching ${req.url}`);
            const url = new URL(req.url);
            if (server.upgrade(req, { data: { url } })) {
                debug.log("debug", "server", "upgrade to websocket");
                return
            };
            delete require.cache[require.resolve("src/App")];

            if (url.pathname.startsWith('/api')) {
                debug.log("debug", "server", "api request");
                const { handleApiRequest } = await import('src/Api');
                return await handleApiRequest(req, server);
            }

            const tspage = PageSrcRouter.match(url.pathname);
            const jspage = PageBuildRouter.match(url.pathname);


            if (!tspage || !jspage) return new Response("501");

            const App = require("src/App").default;

            let stringRender = await renderToReadableStream(
                App(url.pathname, tspage?.filePath),
                {
                    bootstrapScriptContent: `globalThis.react='/pages/${jspage?.src}?v=${Date.now()}';`,
                    bootstrapModules: [
                        `/src/hydrate.js`
                    ],
                    bootstrapScripts: !productionMode ? ["/debug.js"] : [],
                }
            );

            return new Response(stringRender, { headers: { "Content-Type": "text/html" } });
        },
        websocket: websocketHandler
    });

}

function stopServer() {
    if (!host) return;

    debug.log('debug', 'server', 'stopping server')
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
            async (eventType, filename) => {
                if (!filename) return;

                const normalizedFilename = `/${filename.replace(/\\/g, '/')}`;
                const filePath = joinPath(directory, filename);

                let currentHash;
                try {
                    currentHash = await getFileHash(filePath);
                } catch (error) {
                    debug.log("error", "server", `Error getting hash for ${filePath}: ${error}`);
                    return;
                }

                const previousHash = fileHashes[filePath];
                debug.log("debug", "server", `File ${eventType}: ${filePath}`);

                if (previousHash === currentHash) {
                    debug.log("debug", "server", `No changes detected in ${filePath}. Skipping websocket message.`);
                } else {
                    fileHashes[filePath] = currentHash;

                    if (!productionMode) {
                        debugWS?.publish("debug", JSON.stringify({
                            type: eventType,
                            file: normalizedFilename,
                            hash: currentHash
                        }));
                    }
                }

                if (restartTimer) clearTimeout(restartTimer);

                restartTimer = setTimeout(() => {
                    stopServer();
                    startServer();
                }, 500);
            }
        );
    });
}

startServer();
watchDirectories(["dist", "src", "public"]);