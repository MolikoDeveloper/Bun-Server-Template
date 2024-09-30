import { StrictMode } from "react";
import { StaticRouter } from 'react-router-dom/server';
const Error404 = require("./webview/Error404").default;

export default function (location: string, componentPath: string) {
    if (!location) return <Error404 />;
    if (!componentPath) return <Error404 />;
    delete require.cache[require.resolve(`${componentPath}`)];

    const { default: Component } = require(`${componentPath}`);

    if (!Component) {
        return <Error404 />;
    }

    return (
        <StrictMode>
            <StaticRouter location={location}>
                <Component />
            </StaticRouter>
        </StrictMode>
    )
}

