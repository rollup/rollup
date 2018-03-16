import system from './system';
import amd from './amd';
import cjs from './cjs';
import es from './es';
import iife from './iife';
import umd from './umd';
import Chunk, { ChunkDependencies, ChunkExports } from '../Chunk';
import { Bundle as MagicStringBundle } from 'magic-string';
import { OutputOptions } from '../rollup/index';

export type Finaliser = (
	chunk: Chunk,
	magicString: MagicStringBundle,
	{
		exportMode,
		indentString,
		intro,
		outro,
		dependencies,
		exports
	}: {
		exportMode: string;
		indentString: string;
		intro: string;
		outro: string;
		dynamicImport: boolean;
		dependencies: ChunkDependencies;
		exports: ChunkExports;
	},
	options: OutputOptions
) => MagicStringBundle;

export default { system, amd, cjs, es, iife, umd } as {
	[format: string]: Finaliser;
};
