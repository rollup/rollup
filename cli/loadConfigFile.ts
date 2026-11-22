import { loadConfigFile as loadConfig } from './run/loadConfigFile';
import type { LoadConfigFile } from './run/loadConfigFileType';
import { setEnvironment } from './run/setEnvironment';

export const loadConfigFile: LoadConfigFile = async (
	fileName,
	commandOptions = {},
	watchMode = false
) => {
	setEnvironment(commandOptions.environment);
	return loadConfig(fileName, commandOptions, watchMode);
};
