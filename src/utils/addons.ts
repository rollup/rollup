import { OutputOptions } from '../rollup/types';
import { error } from './error';
import { PluginDriver } from './PluginDriver';

export interface Addons {
	banner?: string;
	footer?: string;
	intro?: string;
	outro?: string;
}

function evalIfFn(
	strOrFn: string | (() => string | Promise<string>) | undefined
): string | Promise<string> {
	switch (typeof strOrFn) {
		case 'function':
			return strOrFn();
		case 'string':
			return strOrFn;
		default:
			return '';
	}
}

const concatSep = (out: string, next: string) => (next ? `${out}\n${next}` : out);
const concatDblSep = (out: string, next: string) => (next ? `${out}\n\n${next}` : out);

export async function createAddons(
	options: OutputOptions,
	outputPluginDriver: PluginDriver
): Promise<Addons> {
	try {
		let [banner, footer, intro, outro] = await Promise.all([
			outputPluginDriver.hookReduceValue('banner', evalIfFn(options.banner), [], concatSep),
			outputPluginDriver.hookReduceValue('footer', evalIfFn(options.footer), [], concatSep),
			outputPluginDriver.hookReduceValue('intro', evalIfFn(options.intro), [], concatDblSep),
			outputPluginDriver.hookReduceValue('outro', evalIfFn(options.outro), [], concatDblSep)
		]);
		if (intro) intro += '\n\n';
		if (outro) outro = `\n\n${outro}`;
		if (banner.length) banner += '\n';
		if (footer.length) footer = '\n' + footer;

		return { intro, outro, banner, footer };
	} catch (err) {
		return error({
			code: 'ADDON_ERROR',
			message: `Could not retrieve ${err.hook}. Check configuration of plugin ${err.plugin}.
\tError Message: ${err.message}`
		});
	}
}
