import type {
	LoggingFunctionWithPosition,
	LogHandler,
	LogLevel,
	LogLevelOption
} from '../rollup/types';
import { doNothing } from './doNothing';
import { errorInvalidLogPosition } from './error';
import { LOGLEVEL_WARN, logLevelPriority } from './logging';
import { normalizeLog } from './options/options';

export function getLogHandler(
	level: LogLevel,
	code: string,
	logger: LogHandler,
	pluginName: string,
	logLevel: LogLevelOption
): LoggingFunctionWithPosition {
	if (logLevelPriority[level] < logLevelPriority[logLevel]) {
		return doNothing;
	}
	return (log, pos) => {
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
}
