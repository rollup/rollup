import { version as rollupVersion } from 'package.json';
import type { LoggingFunction, LogHandler, LogLevel, Plugin, RollupLog } from '../rollup/types';
import { getSortedValidatedPlugins } from './PluginDriver';
import { EMPTY_SET } from './blank';
import { error, errorPluginError } from './error';
import { LOGLEVEL_DEBUG, LOGLEVEL_INFO, LOGLEVEL_WARN } from './logging';
import { normalizeLog } from './options/options';

// TODO Lukas implement caching for contexts and handlers
// TODO Lukas Test error handler
export function getLogger(plugins: Plugin[], onLog: LogHandler, watchMode: boolean): LogHandler {
	// TODO Lukas test sorting
	// TODO Lukas cache sorting of other plugins?
	plugins = getSortedValidatedPlugins('onLog', plugins);
	const logger = (level: LogLevel, log: RollupLog, skipped: ReadonlySet<Plugin> = EMPTY_SET) => {
		for (const plugin of plugins) {
			if (skipped.has(plugin)) continue;

			const { name, onLog: pluginOnLog } = plugin;

			const getLogHandler =
				(level: LogLevel): LoggingFunction =>
				log =>
					logger(level, normalizeLog(log), new Set(skipped).add(plugin));

			const handler = 'handler' in pluginOnLog! ? pluginOnLog.handler : pluginOnLog!;
			if (
				handler.call(
					{
						debug: getLogHandler(LOGLEVEL_DEBUG),
						error: (error_): never => error(errorPluginError(error_, name, { hook: 'onLog' })),
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
