import Graph from '../Graph';
import { OutputOptions } from '../rollup/types';
import { error } from './error';

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

export function createAddons(graph: Graph, options: OutputOptions): Promise<Addons> {
	const pluginDriver = graph.pluginDriver;
	const _ = [
		pluginDriver.hookReduceValue('banner', evalIfFn(options.banner), [], concatSep),
		pluginDriver.hookReduceValue('footer', evalIfFn(options.footer), [], concatSep),
		pluginDriver.hookReduceValue('intro', evalIfFn(options.intro), [], concatDblSep),
		pluginDriver.hookReduceValue('outro', evalIfFn(options.outro), [], concatDblSep)
	];
	return (async () :Promise<any> => {
		try {
			let [banner, footer, intro, outro] = await Promise.all(_);
			if (intro) intro += '\n\n';
			if (outro) outro = `\n\n${outro}`;
			if (banner.length) banner += '\n';
			if (footer.length) footer = '\n' + footer;
			return { intro, outro, banner, footer };
		} catch (err) {
			error({
				code: 'ADDON_ERROR',
				message: `Could not retrieve ${err.hook}. Check configuration of plugin ${err.plugin}.
\tError Message: ${err.message}`
			});
		}
	})();
}
