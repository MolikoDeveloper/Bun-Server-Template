import esbuild, { type BuildOptions } from 'esbuild'
import { getFilesArrayFromDir } from 'src/common/getStatics';
import { parseArgs } from 'util';

const { values: args } = parseArgs({
    args: Bun.argv,
    options: {
        watch: {
            type: "boolean",
            default: false,
            short: 'w',
        },
        target: {
            type: "string",
            default: "esm",
            short: "t"
        }
    },
    strict: false,
    allowPositionals: true
})

const productionMode = import.meta.env.NODE_ENV === "production";

if (!["cjs", "esm"].includes(args.target?.toString().toLocaleLowerCase()!)) {
    console.error("Only cjs and esm are available")
    process.exit();
}

const config: BuildOptions = {
    entryPoints: [
        "src/hydrate.tsx",
        ...getFilesArrayFromDir("src/webview"),
        ...getFilesArrayFromDir("pages"),
    ],
    bundle: true,
    outdir: "dist",
    // @ts-ignore
    format: args.target?.toString().toLocaleLowerCase(),
    platform: "browser",
    sourcemap: productionMode ? undefined : 'inline',
    minify: productionMode,
    logLevel: 'info',
    splitting: args.target === "esm",
    entryNames: "[dir]/[name]",
    chunkNames: "chunks/[dir]/[name]-[hash]",
    assetNames: "[dir]/[name]-[hash]",
    allowOverwrite: true,
    drop: productionMode ? ["console", "debugger"] : undefined,
}

if (args.watch) {
    try {
        const ctx = await esbuild.context(config);
        ctx.watch().then(result => {
            console.log('Watching...');
        });
    }
    catch (e) {
        console.error('Build failed:\n', e);
    }
}
else {
    try {
        const result = await esbuild.build(config);
    } catch (e) {
        console.error('Build failed:\n', e);
    }
}