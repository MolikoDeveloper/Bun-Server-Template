import { readdirSync, statSync, readFileSync } from "fs";
import { join, extname } from "path";
import mime from "mime"

export function getFilesArrayFromDir(directory: string, basePath = ''): string[] {
    const result: string[] = [];
    const fullDirPath = join(directory, basePath);

    const files = readdirSync(fullDirPath);
    files.forEach((file) => {
        const filePath = join(fullDirPath, file);

        if (statSync(filePath).isDirectory()) {
            result.push(...getFilesArrayFromDir(directory, join(basePath, file)));
        } else {
            result.push(filePath);
        }
    });

    return result;
}

export function getFilesFromDir(directory: string, basePath: string = ''): Record<string, Response> {
    const result: Record<string, Response> = {};
    const fullDirPath = join(directory, basePath);

    const files = readdirSync(fullDirPath);

    files.forEach((file) => {
        const filePath = join(fullDirPath, file);
        const relativePath = join(basePath, file);

        if (statSync(filePath).isDirectory()) {
            Object.assign(result, getFilesFromDir(directory, relativePath));
        } else {
            const fileContent = readFileSync(filePath);
            const mimeType = mime.getType(extname(file)) || 'application/octet-stream';

            result['/' + relativePath] = new Response(fileContent, {
                headers: { 'Content-Type': mimeType }
            });

        }
    });

    return result;
}

export function getFilesFromDirs(directories: string | string[]): Record<string, Response> {
    const result: Record<string, Response> = {};

    const dirs = Array.isArray(directories) ? directories : [directories];

    dirs.forEach((directory) => {
        Object.assign(result, getFilesFromDir(directory));
    });

    return result;
}