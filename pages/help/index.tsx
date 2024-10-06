import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { Route, Routes } from "react-router-dom";
import ClientOnly from "src/components/ClientOnly";

export default function () {
    useEffect(() => {
        debug.log("info", "webClient", "rendering help page");
    })
    return (
        <>
            <Helmet>
                <title>Ayuda</title>
            </Helmet>
            <ClientOnly>
                <Routes>
                    <Route path="/" element={<>Hola! que tal! :D</>} />
                    <Route path="/hola" element={<>Hola! que tal!</>} />
                </Routes>
            </ClientOnly >
        </>
    )
}