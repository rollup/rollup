import system from './system';
import amd from './amd';
import cjs from './cjs';
import esm from './esm';
import iife from './iife';
import umd from './umd';
import { ChunkDependencies, ChunkExports } from '../Chunk';
import { Bundle as MagicStringBundle } from 'magic-string';
import { OutputOptions } from '../rollup/types';
import Graph from '../Graph';

export interface FinaliserOptions {
	exportMode: string;
	indentString: string;
	intro: string;
	outro: string;
	dynamicImport: boolean;
	importMeta: boolean;
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

export default { system, amd, cjs, es: esm, iife, umd } as {
	[format: string]: Finaliser;
};
