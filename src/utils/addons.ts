import Graph from '../Graph';
import { OutputOptions } from '../rollup/types';
import error from './error';

export interface Addons {
	intro?: string;
	outro?: string;
	banner?: string;
	footer?: string;
	hash: Uint8Array;
}

function strOrFn(strOrFn: string | (() => string | Promise<string>)) {
	switch (typeof strOrFn) {
		case 'function':
			return (<() => string | Promise<string>>strOrFn)();
		case 'string':
			return <string>strOrFn;
		default:
			return '';
	}
}

const reduceSep = (out: string, next: string) => (next ? `${out}\n${next}` : out);
const reduceDblSep = (out: string, next: string) => (next ? `${out}\n\n${next}` : out);

export function createAddons(graph: Graph, options: OutputOptions): Promise<Addons> {
	const pluginDriver = graph.pluginDriver;
	return Promise.all([
		pluginDriver.hookReduceValue('banner', strOrFn(options.banner), [], reduceSep),
		pluginDriver.hookReduceValue('footer', strOrFn(options.footer), [], reduceSep),
		pluginDriver.hookReduceValue('intro', strOrFn(options.intro), [], reduceDblSep),
		pluginDriver.hookReduceValue('outro', strOrFn(options.outro), [], reduceDblSep)
	])
		.then(([banner, footer, intro, outro]) => {
			if (intro) intro += '\n\n';
			if (outro) outro = `\n\n${outro}`;
			if (banner.length) banner += '\n';
			if (footer.length) footer = '\n' + footer;

			const hash = new Uint8Array(4);

			return { intro, outro, banner, footer, hash };
		})
		.catch(
			(err): any => {
				error({
					code: 'ADDON_ERROR',
					message: `Could not retrieve ${err.hook}. Check configuration of ${err.plugin}.
\tError Message: ${err.message}`
				});
			}
		);
}
