import { useEffect, useState } from "react";

interface props {
    children: React.SetStateAction<JSX.Element>;
}

export default function ({ children }: props) {
    const [component, setComponent] = useState(<h2>loading...</h2>);
    useEffect(() => {
        setComponent(children);
    }, [])
    return component;
}