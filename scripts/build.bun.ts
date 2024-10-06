import { parseArgs } from 'util';
import { getFilesArrayFromDir } from 'src/common/getStatics';
import type { BuildConfig } from 'bun';
import { rmSync, watch } from "fs";

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
    console.log("only esm is available in Bun");
    process.exit();
}

const Initconfig: BuildConfig = {
    entrypoints: [
        "src/hydrate.tsx",
        ...getFilesArrayFromDir('src/components'),
        ...getFilesArrayFromDir('pages')
    ],
    outdir: 'dist',
    target: 'browser',
    // @ts-ignore
    format: args.target?.toString().toLocaleLowerCase(),
    sourcemap: productionMode ? undefined : "linked",
    minify: true,
    splitting: true,
    naming: {
        entry: '[dir]/[name].[ext]',
        asset: '[dir]/[name]-[hash].[ext]',
        chunk: '[dir]/chunk/[name]-[hash].[ext]',
    }
}

if (args.watch) {
    try {
        ["src", "pages"].forEach(dir => {
            console.log(`watching ${dir}`);

            Bun.build(Initconfig);

            watch(dir, { recursive: true }, (event, file) => {
                if (file!.endsWith('.css')) return;
                rmSync("dist/src/chunk", { recursive: true, force: true })
                if (file !== "App.tsx") {
                    Bun.build(Initconfig).then(result => {
                        console.log(`${event} ${dir}/${file} ${result.success ? "🟢" : "🔴"}`)
                        if (!result.success)
                            console.log(result.logs);
                    })
                }
            })
        })
    }
    catch (e) {
        console.error(e)
    }
}
else {
    try {
        Bun.build(Initconfig);
    }
    catch (e) {

    }
}