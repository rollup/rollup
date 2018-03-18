import system from './system';
import amd from './amd';
import cjs from './cjs';
import es from './es';
import iife from './iife';
import umd from './umd';
import { ChunkDependencies, ChunkExports } from '../Chunk';
import { Bundle as MagicStringBundle } from 'magic-string';
import { OutputOptions } from '../rollup/index';
import Graph from '../Graph';

export interface FinaliserOptions {
	exportMode: string;
	indentString: string;
	intro: string;
	outro: string;
	dynamicImport: boolean;
	dependencies: ChunkDependencies;
	exports: ChunkExports;
	graph: Graph;
	isEntryModuleFacade: boolean;
}

export type Finaliser = (
	magicString: MagicStringBundle,
	finaliserOptions: FinaliserOptions,
	options: OutputOptions
) => MagicStringBundle;

export default { system, amd, cjs, es, iife, umd } as {
	[format: string]: Finaliser;
};
