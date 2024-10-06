import { StrictMode } from "react";
import { StaticRouter } from 'react-router-dom/server';

export default function (location: string, componentPath: string) {
    delete require.cache[require.resolve(`${componentPath}`)];
    const { default: Component } = require(`${componentPath}`);

    return (
        <html>
            <head>
                <link rel="stylesheet" href="index.css" />
            </head>
            <body>
                <div id="root">
                    <StrictMode>
                        <StaticRouter location={location}>
                            <Component />
                        </StaticRouter>
                    </StrictMode>
                </div>
            </body>
        </html>
    )
}

