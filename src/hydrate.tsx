import { lazy } from "react";
import { hydrateRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";

// @ts-ignore
const appLocation = globalThis?.react;

if (!appLocation) {
    console.error("No app found");
}
else {
    const App = lazy(() => import(appLocation));
    console.log("hydrating...")
    hydrateRoot(document,
        <HashRouter>
            <App />
        </HashRouter>
    );
}