import type { Bundle as MagicStringBundle } from 'magic-string';
import type { ChunkDependency, ChunkExports } from '../Chunk';
import type { LogHandler, NormalizedOutputOptions } from '../rollup/types';
import type { GenerateCodeSnippets } from '../utils/generateCodeSnippets';
import amd from './amd';
import cjs from './cjs';
import es from './es';
import iife from './iife';
import system from './system';
import umd from './umd';

export interface FinaliserOptions {
	accessedGlobals: Set<string>;
	dependencies: ChunkDependency[];
	exports: ChunkExports;
	hasDefaultExport: boolean;
	hasExports: boolean;
	id: string;
	indent: string;
	intro: string;
	isEntryFacade: boolean;
	isModuleFacade: boolean;
	log: LogHandler;
	namedExportsMode: boolean;
	outro: string;
	snippets: GenerateCodeSnippets;
	usesTopLevelAwait: boolean;
}

export type Finaliser = (
	magicString: MagicStringBundle,
	finaliserOptions: FinaliserOptions,
	options: NormalizedOutputOptions
) => void;

export default { amd, cjs, es, iife, system, umd } as {
	[format: string]: Finaliser;
};
