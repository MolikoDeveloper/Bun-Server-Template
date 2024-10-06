import { Helmet } from "react-helmet";
import { Route, Routes } from "react-router-dom";
import ClientOnly from "src/components/ClientOnly";

export default function () {
    return (
        <>
            <Helmet>
                <title>Inicio</title>
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
