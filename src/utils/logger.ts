import { version as rollupVersion } from 'package.json';
import type {
	LoggingFunction,
	LogHandler,
	LogLevel,
	LogLevelOption,
	Plugin,
	RollupLog
} from '../rollup/types';
import { getSortedValidatedPlugins } from './PluginDriver';
import { EMPTY_SET } from './blank';
import { doNothing } from './doNothing';
import { LOGLEVEL_DEBUG, LOGLEVEL_INFO, LOGLEVEL_WARN, logLevelPriority } from './logging';
import { error } from './logs';
import { normalizeLog } from './options/options';

export function getLogger(
	plugins: Plugin[],
	onLog: LogHandler,
	watchMode: boolean,
	logLevel: LogLevelOption
): LogHandler {
	plugins = getSortedValidatedPlugins('onLog', plugins);
	const minimalPriority = logLevelPriority[logLevel];
	const logger = (level: LogLevel, log: RollupLog, skipped: ReadonlySet<Plugin> = EMPTY_SET) => {
		const logPriority = logLevelPriority[level];
		if (logPriority < minimalPriority) {
			return;
		}
		for (const plugin of plugins) {
			if (skipped.has(plugin)) continue;

			const { onLog: pluginOnLog } = plugin;

			const getLogHandler = (level: LogLevel): LoggingFunction => {
				if (logLevelPriority[level] < minimalPriority) {
					return doNothing;
				}
				return log => logger(level, normalizeLog(log), new Set(skipped).add(plugin));
			};

			const handler = 'handler' in pluginOnLog! ? pluginOnLog.handler : pluginOnLog!;
			if (
				handler.call(
					{
						debug: getLogHandler(LOGLEVEL_DEBUG),
						error: (log): never => error(normalizeLog(log)),
						info: getLogHandler(LOGLEVEL_INFO),
						meta: { rollupVersion, watchMode },
						warn: getLogHandler(LOGLEVEL_WARN)
					},
					level,
					log
				) === false
			) {
				return;
			}
		}
		onLog(level, log);
	};

	return logger;
}
