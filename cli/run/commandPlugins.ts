import * as path from 'path';
import { InputOptions } from '../../src/rollup/types';
import { stdinPlugin } from './stdin';
import { waitForInputPlugin } from './waitForInput';

export async function addCommandPluginsToInputOptions(
	inputOptions: InputOptions,
	command: Record<string, unknown>
): Promise<void> {
	if (command.stdin !== false) {
		inputOptions.plugins!.push(stdinPlugin(command.stdin));
	}
	if (command.waitForBundleInput === true) {
		inputOptions.plugins!.push(waitForInputPlugin());
	}
	await addPluginsFromCommandOption(command.plugin, inputOptions);
}

export async function addPluginsFromCommandOption(
	commandPlugin: unknown,
	inputOptions: InputOptions
): Promise<void> {
	if (commandPlugin) {
		const plugins = Array.isArray(commandPlugin) ? commandPlugin : [commandPlugin];
		for (const plugin of plugins) {
			if (/[={}]/.test(plugin)) {
				// -p plugin=value
				// -p "{transform(c,i){...}}"
				await loadAndRegisterPlugin(inputOptions, plugin);
			} else {
				// split out plugins joined by commas
				// -p node-resolve,commonjs,buble
				for (const p of plugin.split(',')) {
					await loadAndRegisterPlugin(inputOptions, p);
				}
			}
		}
	}
}

async function loadAndRegisterPlugin(inputOptions: InputOptions, pluginText: string) {
	let plugin: any = null;
	let pluginArg: any = undefined;
	if (pluginText[0] === '{') {
		// -p "{transform(c,i){...}}"
		plugin = new Function('return ' + pluginText);
	} else {
		const match = pluginText.match(/^([@./\\\w|^{}-]+)(=(.*))?$/);
		if (match) {
			// -p plugin
			// -p plugin=arg
			pluginText = match[1];
			pluginArg = new Function('return ' + match[3])();
		} else {
			throw new Error(`Invalid --plugin argument format: ${JSON.stringify(pluginText)}`);
		}
		if (!/^\.|^rollup-plugin-|[@/\\]/.test(pluginText)) {
			// Try using plugin prefix variations first if applicable.
			// Prefix order is significant - left has higher precedence.
			for (const prefix of ['@rollup/plugin-', 'rollup-plugin-']) {
				try {
					plugin = await requireOrImport(prefix + pluginText);
					break;
				} catch {
					// if this does not work, we try requiring the actual name below
				}
			}
		}
		if (!plugin) {
			try {
				if (pluginText[0] == '.') pluginText = path.resolve(pluginText);
				plugin = await requireOrImport(pluginText);
			} catch (err: any) {
				throw new Error(`Cannot load plugin "${pluginText}": ${err.message}.`);
			}
		}
	}
	// some plugins do not use `module.exports` for their entry point,
	// in which case we try the named default export and the plugin name
	if (typeof plugin === 'object') {
		plugin = plugin.default || plugin[getCamelizedPluginBaseName(pluginText)];
	}
	if (!plugin) {
		throw new Error(
			`Cannot find entry for plugin "${pluginText}". The plugin needs to export a function either as "default" or "${getCamelizedPluginBaseName(
				pluginText
			)}" for Rollup to recognize it.`
		);
	}
	inputOptions.plugins!.push(
		typeof plugin === 'function' ? plugin.call(plugin, pluginArg) : plugin
	);
}

function getCamelizedPluginBaseName(pluginText: string): string {
	return (pluginText.match(/(@rollup\/plugin-|rollup-plugin-)(.+)$/)?.[2] || pluginText)
		.split(/[\\/]/)
		.slice(-1)[0]
		.split('.')[0]
		.split('-')
		.map((part, index) => (index === 0 || !part ? part : part[0].toUpperCase() + part.slice(1)))
		.join('');
}

async function requireOrImport(pluginPath: string): Promise<any> {
	try {
		return require(pluginPath);
	} catch {
		return import(pluginPath);
	}
}
