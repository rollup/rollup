import { Bundle as MagicStringBundle } from 'magic-string';
import { ChunkDependencies, ChunkExports } from '../Chunk';
import { NormalizedOutputOptions, RollupWarning } from '../rollup/types';
import { GenerateCodeSnippets } from '../utils/generateCodeSnippets';
import amd from './amd';
import cjs from './cjs';
import es from './es';
import iife from './iife';
import system from './system';
import umd from './umd';

export interface FinaliserOptions {
	accessedGlobals: Set<string>;
	dependencies: ChunkDependencies;
	exports: ChunkExports;
	hasExports: boolean;
	id: string;
	indentString: string;
	intro: string;
	isEntryFacade: boolean;
	isModuleFacade: boolean;
	namedExportsMode: boolean;
	outro: string;
	snippets: GenerateCodeSnippets;
	usesTopLevelAwait: boolean;
	varOrConst: 'var' | 'const';
	warn(warning: RollupWarning): void;
}

export type Finaliser = (
	magicString: MagicStringBundle,
	finaliserOptions: FinaliserOptions,
	options: NormalizedOutputOptions
) => MagicStringBundle;

export default { amd, cjs, es, iife, system, umd } as {
	[format: string]: Finaliser;
};
