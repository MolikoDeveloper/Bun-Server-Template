import { parseArgs } from 'util';
import { consoleColor } from 'src/common/Util';
import type { FileSink } from 'bun';

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
type Source = 'webServer' | 'webClient' | 'react' | 'database' | 'websocket' | 'DebugWebsocket' | 'api' | 'bundler' | 'server';
type Format = 'log' | 'json';

type LogStruct = {
    timestamp: Date | string,
    level: LogLevel,
    message: any[],
    source: Source | { source: Source, user: string },
    format?: Format
}

const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'fatal'];

const { values: args } = parseArgs({
    args: Bun.argv,
    options: {
        log: { type: 'boolean', default: false, short: 'l' },
        logStyle: { type: 'string', "default": 'terminal' },
        logLevel: { type: 'string', default: 'debug', short: 'L' },
        'save-logs': { type: 'boolean', default: false, short: 's' },
        'log-path': { type: 'string', default: './logs', short: 'S' },
        'log-format': { type: 'string', default: 'log', short: 'f' }
    },
    strict: true,
    allowPositionals: true
});

let color = consoleColor;

const file = Bun.file(`${args['log-path']}/last.log`);

if (args['save-logs']) {
    file.exists().then(async exist => {
        if (exist) {
            const old = Bun.file(`${args['log-path']}/log ${new Date().toLocaleString().replaceAll('/', '-')}.${args['log-format']}`);
            await Bun.write(old, file);
        }
    }).finally(() => Bun.write(file, ''));
}

const writer: FileSink | undefined = undefined;//file.writer(); //{ highWaterMark: 1024 * 1024 }

class Debug {
    static log(level: LogLevel, source: Source | { source: Source, user: string }, ...data: any[]) {
        if (!args.log) return;

        const currentLevelIndex = levels.indexOf(args.logLevel as LogLevel);
        if (levels.indexOf(level) < currentLevelIndex) return;

        const logEntry: LogStruct = {
            level,
            source,
            timestamp: new Date().toLocaleString(),
            message: data,
            format: args['log-format'] as Format
        };

        this.printLog(logEntry);
        if (args['save-logs']) this.saveLog(logEntry);
    }

    private static printLog({ timestamp, source, level, message }: LogStruct) {
        const sourceText = typeof source === 'string' ? this.getSourceColor(source) : `${this.getSourceColor(source.source)}/${color.color.Red}${source.user.toUpperCase()}${color.Reset}`;
        console.log(`[${timestamp}] [${sourceText}/${this.getLevelColor(level)}]:`, ...message);
    }

    private static saveLog({ timestamp, source, level, message, format }: LogStruct) {
        if (format !== 'log') throw new Error('log format not available, please prefer "log" or "json" as a valid format.');

        const cleanMessage = message.map((msg: any) => typeof msg === 'string' ? msg.replace(/\x1b\[[0-9;]*m/g, '') : msg).join(' ');
        const sourceText = typeof source === 'string' ? this.getSourceColor(source) : `${this.getSourceColor(source.source)}/${color.color.Red}${source.user.toUpperCase()}${color.Reset}`;
        const logString = `[${new Date(timestamp).toLocaleString()}] [${sourceText.replace(/\x1b\[[0-9;]*m/g, '')}/${level.toLowerCase()}]: ${cleanMessage}\n`;

        //writer.write(logString);
    }

    private static getLevelColor(level: LogLevel) {
        const colorMap = {
            debug: color.color.Yellow,
            info: color.color.Green,
            warn: color.BrightColor.Yellow,
            error: color.color.Red,
            fatal: color.BrightColor.Red
        };
        return `${colorMap[level]}${level.toUpperCase()}${color.Reset}`;
    }

    private static getSourceColor(source: Source) {
        const sourceColorMap = {
            webServer: color.color.Yellow,
            webClient: color.BrightColor.Yellow,
            react: color.BrightColor.Cyan,
            database: color.color.Green,
            websocket: color.BrightColor.Magenta,
            DebugWebsocket: color.BrightColor.Yellow,
            api: color.color.Cyan,
            bundler: color.color.Blue,
            server: color.BrightColor.Red
        };
        return `${sourceColorMap[source]}${source.toUpperCase()}${color.Reset}`;
    }
}

(globalThis as any).debug = Debug;
export default Debug;
