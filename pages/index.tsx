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
                    <Route>
                        <Route path="/" element={<>Hola! que tal!</>}></Route>
                    </Route>
                </Routes>
            </ClientOnly>
        </>
    )
}
