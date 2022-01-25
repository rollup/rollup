import { NormalizedOutputOptions } from '../rollup/types';
import { PluginDriver } from './PluginDriver';
import { error } from './error';

export interface Addons {
	banner: string;
	footer: string;
	intro: string;
	outro: string;
}

const concatSep = (out: string, next: string) => (next ? `${out}\n${next}` : out);
const concatDblSep = (out: string, next: string) => (next ? `${out}\n\n${next}` : out);

export async function createAddons(
	options: NormalizedOutputOptions,
	outputPluginDriver: PluginDriver
): Promise<Addons> {
	try {
		let [banner, footer, intro, outro] = await Promise.all([
			outputPluginDriver.hookReduceValue('banner', options.banner(), [], concatSep),
			outputPluginDriver.hookReduceValue('footer', options.footer(), [], concatSep),
			outputPluginDriver.hookReduceValue('intro', options.intro(), [], concatDblSep),
			outputPluginDriver.hookReduceValue('outro', options.outro(), [], concatDblSep)
		]);
		if (intro) intro += '\n\n';
		if (outro) outro = `\n\n${outro}`;
		if (banner.length) banner += '\n';
		if (footer.length) footer = '\n' + footer;

		return { banner, footer, intro, outro };
	} catch (err: any) {
		return error({
			code: 'ADDON_ERROR',
			message: `Could not retrieve ${err.hook}. Check configuration of plugin ${err.plugin}.
\tError Message: ${err.message}`
		});
	}
}
