import { useEffect } from "react";
import { Helmet } from "react-helmet";

export default function () {
    useEffect(() => {
        debug.log("info", "webClient", "rendering help page");
    })
    return (
        <>
            <Helmet>
                <title>Ayuda</title>
            </Helmet>
            <>
                <h1>Esto es ayuda</h1>
                <button onClick={() => { console.log("hola!") }}>aaa :D</button>
            </>
        </>
    )
}