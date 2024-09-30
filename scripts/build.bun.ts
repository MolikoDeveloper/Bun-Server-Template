import { parseArgs } from 'util';
import { getFilesArrayFromDir } from 'src/common/getStatics';
import type { BuildConfig } from 'bun';
import { watch, statSync } from "fs";
import { bundlerModuleNameResolver } from 'typescript';


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

if (!["esm"].includes(args.target?.toString().toLocaleLowerCase()!)) {
    console.error("Only esm is available in Bun")
    process.exit();
}

const config: BuildConfig = {
    entrypoints: [
        "src/hydrate.tsx",
        ...getFilesArrayFromDir('src/webview'),
        ...getFilesArrayFromDir('pages')
    ],
    outdir: 'dist',
    target: 'browser',
    // @ts-ignore
    format: args.target?.toString().toLocaleLowerCase(),
    sourcemap: productionMode ? undefined : "inline",
    minify: productionMode,
    splitting: args.target === 'esm',
    naming: {
        entry: '[dir]/[name].[ext]',
        chunk: 'chunks/[dir]/[name]-[hash].[ext]',
        asset: '[dir]/[name]-[hash].[ext]'
    }
}

if (args.watch) {
    try {
        [
            "src", "pages"
        ].forEach(dir => {
            watch(dir, { recursive: true }, (event, file) => {
                if (file === "App.tsx") return;
                Bun.build(config).then(result => {
                    console.log(result.success)
                })
            })
        })
    }
    catch (e) {
        console.log(e);
    }
}
else {
    try {
        Bun.build(config);
    }
    catch (e) {

    }
}