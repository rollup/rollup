interface SourceMap {
	version: 3;
	// TODO the rest
}

type Source = string | { code: string, map: SourceMap };

export interface Plugin {
	name: string;
	resolveId: (importee: string, importer: string) => string;
	load: (id: string) => Source | null;
	transform: (code: string) => Source | null;
	// TODO the rest
}

export interface InputOptions {
	// required
	input: string;

	// optional
	onwarn: WarningHandler;

	// deprecated
	entry: string;
	transform: any;
	load: any;
	resolveId: any;
	resolveExternal: any;
}

export type ModuleFormat = 'amd' | 'cjs' | 'es' | 'es6' | 'iife' | 'umd';

export interface OutputOptions {
	// required
	file: string;
	format: ModuleFormat;

	// optional
	amd?: {
		id?: string;
		define?: string;
	}
	name: string;
	sourcemap: boolean | 'inline';

	// deprecated
	dest: string;
	moduleId: string;
}

export interface Warning {
	message: string;
	code?: string;
	[prop: string]: any;
}

export type WarningHandler = (warning: Warning) => void;