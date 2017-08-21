export interface SourceMap {
	version: 3;
	// TODO the rest
}

export type Source = string | { code: string, map: SourceMap };

export interface Plugin {
	name: string;
	resolveId?: (importee: string, importer: string) => string;
	load?: (id: string) => Source | null;
	transform?: (code: string) => Source | null;
	banner?: () => string;
	footer?: () => string;
	intro?: () => string;
	outro?: () => string;
	// TODO the rest
}

export interface InputOptions {
	// required
	input: string;

	// optional
	onwarn?: WarningHandler;
	plugins?: Plugin[];
	treeshake?: boolean;

	// deprecated
	entry?: string;
	transform?: any;
	load?: any;
	resolveId?: any;
	resolveExternal?: any;
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
	name?: string;
	sourcemap?: boolean | 'inline';
	sourcemapFile?: string;
	banner?: string;
	footer?: string;
	intro?: string;
	outro?: string;
	paths?: Record<string, string> | ((id: string) => string);

	// deprecated
	dest?: string;
	moduleId?: string;
}

export interface Warning {
	message: string;
	code?: string;
	[prop: string]: any;
}

export type WarningHandler = (warning: Warning) => void;