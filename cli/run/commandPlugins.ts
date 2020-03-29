import * as path from 'path';
import { InputOptions } from '../../src/rollup/types';
import { stdinPlugin } from './stdin';

export function addCommandPluginsToInputOptions(
	inputOptions: InputOptions,
	command: any
) {
	if (command.stdin !== false) {
		inputOptions.plugins!.push(stdinPlugin());
	}
	const commandPlugin = command.plugin;
	if (commandPlugin) {
		const plugins = Array.isArray(commandPlugin) ? commandPlugin : [commandPlugin];
		for (const plugin of plugins) {
			if (/[={}]/.test(plugin)) {
				// -p plugin=value
				// -p "{transform(c,i){...}}"
				loadAndRegisterPlugin(inputOptions, plugin);
			} else {
				// split out plugins joined by commas
				// -p node-resolve,commonjs,buble
				plugin.split(',').forEach((plugin: string) => loadAndRegisterPlugin(inputOptions, plugin));
			}
		}
	}
}

function loadAndRegisterPlugin(inputOptions: InputOptions, pluginText: string) {
	let plugin: any = null;
	let pluginArg: any = undefined;
	if (pluginText[0] === '{') {
		// -p "{transform(c,i){...}}"
		plugin = new Function('return ' + pluginText);
	} else {
		const match = pluginText.match(/^([@.\/\\\w|^{}|-]+)(=(.*))?$/);
		if (match) {
			// -p plugin
			// -p plugin=arg
			pluginText = match[1];
			pluginArg = new Function('return ' + match[3])();
		} else {
			throw new Error(`Invalid --plugin argument format: ${JSON.stringify(pluginText)}`);
		}
		if (!/^\.|^rollup-plugin-|[@\/\\]/.test(pluginText)) {
			// Try using plugin prefix variations first if applicable.
			// Prefix order is significant - left has higher precedence.
			for (const prefix of ['@rollup/plugin-', 'rollup-plugin-']) {
				try {
					plugin = require(prefix + pluginText);
					break;
				} catch (ex) {
					// if this does not work, we try requiring the actual name below
				}
			}
		}
		if (!plugin) {
			try {
				if (pluginText[0] == '.') pluginText = path.resolve(pluginText);
				plugin = require(pluginText);
			} catch (ex) {
				throw new Error(`Cannot load plugin "${pluginText}"`);
			}
		}
	}
	if (typeof plugin === 'object' && pluginText in plugin) {
		// some plugins do not use `export default` for their entry point.
		// attempt to use the plugin name as the named import name.
		plugin = plugin[pluginText];
	}
	inputOptions.plugins!.push(
		typeof plugin === 'function' ? plugin.call(plugin, pluginArg) : plugin
	);
}
