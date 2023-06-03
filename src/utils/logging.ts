import type { LogLevel, LogLevelOption } from '../rollup/types';

export const LOGLEVEL_SILENT: LogLevelOption = 'silent';
export const LOGLEVEL_ERROR = 'error';
export const LOGLEVEL_WARN: LogLevel = 'warn';
export const LOGLEVEL_INFO: LogLevel = 'info';
export const LOGLEVEL_DEBUG: LogLevel = 'debug';

export const logLevelPriority: Record<LogLevelOption, number> = {
	[LOGLEVEL_DEBUG]: 0,
	[LOGLEVEL_INFO]: 1,
	[LOGLEVEL_SILENT]: 3,
	[LOGLEVEL_WARN]: 2
};
