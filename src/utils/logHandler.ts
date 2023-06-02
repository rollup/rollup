import type { LoggingFunctionWithPosition, LogHandler, LogLevel } from '../rollup/types';
import { errorInvalidLogPosition } from './error';
import { LOGLEVEL_WARN } from './logging';
import { normalizeLog } from './options/options';

export const getLogHandler =
	(
		level: LogLevel,
		code: string,
		logger: LogHandler,
		pluginName: string
	): LoggingFunctionWithPosition =>
	(log, pos) => {
		if (pos != null) {
			logger(LOGLEVEL_WARN, errorInvalidLogPosition(pluginName));
		}
		log = normalizeLog(log);
		if (log.code) {
			log.pluginCode = log.code;
		}
		log.code = code;
		log.plugin = pluginName;
		logger(level, log);
	};
