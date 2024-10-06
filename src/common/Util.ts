

export const GetDocumentCookie = (name: string) => {
    return globalThis.document!.cookie?.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || undefined;
}

export const RemoveDocumentCookie = (name: string) => {
    const expires = new Date(0).toUTCString();
    globalThis.document.cookie = `${name}=; expires=${expires}; path=/`;
    window.location.href = "/login"
}

export const GetRequestCookie = (request: Request, name: string) => {
    return request.headers.get('cookie')?.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || undefined;
}

export const consoleColor = {
    "Reset": "\u001b[0m",
    "color": {

        "back": "\u001b[30m",
        "Red": "\u001b[31m",
        "Green": "\u001b[32m",
        "Yellow": "\u001b[33m",
        "Blue": "\u001b[34m",
        "Magenta": "\u001b[35m",
        "Cyan": "\u001b[36m",
        "White": "\u001b[37m"
    },
    "BrightColor": {
        "Black": "\u001b[30;1m",
        "Red": "\u001b[31;1m",
        "Green": "\u001b[32;1m",
        "Yellow": "\u001b[33;1m",
        "Blue": "\u001b[34;1m",
        "Magenta": "\u001b[35;1m",
        "Cyan": "\u001b[36;1m",
        "White": "\u001b[37;1m"
    },
    "background": {
        "Red": "\u001b[41m",
        "Black": "\u001b[40m",
        "Green": "\u001b[42m",
        "Yellow": "\u001b[43m",
        "Blue": "\u001b[44m",
        "Magenta": "\u001b[45m",
        "Cyan": "\u001b[46m",
        "White": "\u001b[47m"
    },
    "backgroundBright": {
        "Black": "\u001b[40;1m",
        "Red": "\u001b[41;1m",
        "Green": "\u001b[42;1m",
        "Yellow": "\u001b[43;1m",
        "Blue": "\u001b[44;1m",
        "Magenta": "\u001b[45;1m",
        "Cyan": "\u001b[46;1m",
        "White": "\u001b[47;1m"
    }
}