import type { Server } from "bun";

type HandlerFunction = (req: Request, params: Record<string, string>) => Promise<Response>;

interface Route {
    method: string;
    pattern: RegExp;
    handler: HandlerFunction;
}

const routes: Route[] = [
    {
        method: 'GET',
        pattern: /^\/api(?:\/)?$/,
        handler: async (req) => {
            return new Response(":D");
        }
    },
    {
        method: 'GET',
        pattern: /^\/api\/hello$/,
        handler: async (req) => {
            return Response.json({ message: 'Hello, World!' });
        },
    },
    {
        method: 'GET',
        pattern: /^\/api\/users\/(?<userId>\d+)$/,
        handler: async (req, params) => {
            const { userId } = params;
            const user = { id: userId, name: 'John Doe' };
            return Response.json(user);
        },
    },
];

export async function handleApiRequest(req: Request, server: Server): Promise<Response> {
    const url = new URL(req.url);
    const pathname = url.pathname;
    const method = req.method.toUpperCase();

    if (!isAuthenticated(req)) {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    for (const route of routes) {
        if (method === route.method) {
            const match = route.pattern.exec(pathname);

            if (match) {
                const params = match.groups || {};
                try {
                    return await route.handler(req, params);
                } catch (error) {
                    console.error('API Error:', error);
                    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
                        status: 500,
                        headers: { 'Content-Type': 'application/json' },
                    });
                }
            }
        }
    }

    return new Response(JSON.stringify({ error: 'Not Found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
    });
}

function isAuthenticated(req: Request): boolean {
    return true; // Placeholder
}