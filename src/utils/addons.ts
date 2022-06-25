import type { NormalizedOutputOptions, RenderedChunk } from '../rollup/types';
import type { PluginDriver } from './PluginDriver';
import { errAddonNotGenerated, error } from './error';

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
	outputPluginDriver: PluginDriver,
	chunk: RenderedChunk
): Promise<Addons> {
	try {
		let [banner, footer, intro, outro] = await Promise.all([
			outputPluginDriver.hookReduceValue('banner', options.banner(chunk), [chunk], concatSep),
			outputPluginDriver.hookReduceValue('footer', options.footer(chunk), [chunk], concatSep),
			outputPluginDriver.hookReduceValue('intro', options.intro(chunk), [chunk], concatDblSep),
			outputPluginDriver.hookReduceValue('outro', options.outro(chunk), [chunk], concatDblSep)
		]);
		if (intro) intro += '\n\n';
		if (outro) outro = `\n\n${outro}`;
		if (banner) banner += '\n';
		if (footer) footer = '\n' + footer;

		return { banner, footer, intro, outro };
	} catch (err: any) {
		return error(errAddonNotGenerated(err.message, err.hook, err.plugin));
	}
}
