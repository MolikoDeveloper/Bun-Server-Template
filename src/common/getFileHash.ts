
export async function getFileHash(path: string) {
    const file = Bun.file(path);
    const text = await file.text();
    const hasher = new Bun.CryptoHasher("sha256");
    const encrypted = hasher.update(text);

    return encrypted.digest("hex")
}