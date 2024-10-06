import { useState } from "react";
import { Helmet } from "react-helmet";

export default function () {
    const [count, setCount] = useState(0)

    return (
        <>
            <Helmet>
                <title>Bun + React</title>
            </Helmet>
            <a href="https://bun.sh" target="_blank">
                <img src="/bun.svg" className="logo" alt="Bun Logo" />
            </a>
            <a href="https://react.dev" target="_blank">
                <img src="/react.svg" className="logo" alt="Bun Logo" />
            </a>
            <h2>Welcome to your new Bun + React project!</h2>
            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>
                    count is {count}
                </button>
                <p>
                    Edit <code>pages/index.tsx</code> and save to test hot reloading.
                </p>
                <p>
                    Web Style from <a target="__blank" href="https://vite.dev">vite</a>!
                </p>
            </div>
        </>
    )
}
