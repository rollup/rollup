import { Bundle as MagicStringBundle } from 'magic-string';
import { ChunkDependencies, ChunkExports } from '../Chunk';
import Graph from '../Graph';
import { OutputOptions } from '../rollup/types';
import amd from './amd';
import cjs from './cjs';
import esm from './esm';
import iife from './iife';
import system from './system';
import umd from './umd';

export interface FinaliserOptions {
	indentString: string;
	namedExportsMode: boolean;
	hasExports: boolean;
	intro: string;
	outro: string;
	dynamicImport: boolean;
	needsAmdModule: boolean;
	dependencies: ChunkDependencies;
	exports: ChunkExports;
	graph: Graph;
	isEntryModuleFacade: boolean;
	usesTopLevelAwait: boolean;
}

export type Finaliser = (
	magicString: MagicStringBundle,
	finaliserOptions: FinaliserOptions,
	options: OutputOptions
) => MagicStringBundle;

export default { system, amd, cjs, es: esm, iife, umd } as {
	[format: string]: Finaliser;
};
