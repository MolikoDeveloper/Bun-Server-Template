import Layout from "src/webview/Layout";

export default function () {
    console.log("hola que tal!!")
    return (
        <Layout title="Title">
            <h1>inicio!!!!!!</h1>
            <button onClick={() => alert("Hello")}>press me :D</button>
        </Layout>
    )
}