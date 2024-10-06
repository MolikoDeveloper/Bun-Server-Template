import { hydrateRoot, type Root } from "react-dom/client";
import { HashRouter } from "react-router-dom";

let root: Root | null = null;
let CurrentApp: React.FC | null = null;

async function doHydrate(appLocation: string) {
    debug.log("info", "webClient", `Hydrating with ${appLocation.split("?")[0]}`);

    try {
        const module = await import(appLocation);

        if (!module || !module.default) {
            debug.log("error", "webClient", "Module does not have a default export.");
            return;
        }

        CurrentApp = module.default as React.FC<{}>;

        const container = document.getElementById('root');

        if (!container) {
            debug.log("error", "webClient", "There is no 'root' container.");
            return;
        }

        if (!root) {
            root = hydrateRoot(container,
                <HashRouter>
                    <CurrentApp />
                </HashRouter>
            );
        } else {
            root.render(
                <HashRouter>
                    <CurrentApp />
                </HashRouter>
            );
        }
    } catch (error) {
        debug.log("error", "webClient", `Failed to load module: ${error}`);
    }
}

if (!globalThis.debug) {

    (globalThis as any).debug = {
        log:
            (level: string, source: string, message: string) => {
                return;
            }
    }
}

(globalThis as any).doHydrate = doHydrate;

const appLocation = (globalThis as any).react;

if (!appLocation) {
    console.error("No se encontró la ubicación de la aplicación.");
} else {
    doHydrate(appLocation);
}
