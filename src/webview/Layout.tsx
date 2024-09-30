import type { ReactNode } from "react";

export default function ({ title, children }: { title: string, children?: ReactNode }) {
    return (
        <html>
            <head>
                <title>{title}</title>
            </head>
            <body>
                <div>
                    {children}
                </div>
            </body>
        </html>
    )
}