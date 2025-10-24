import type { RollupOptions } from '../src/rollup/types';

export interface Module {
	code: string;
	isEntry: boolean;
	name: string;
}

export interface Example {
	id: string;
	modules: Module[];
	options: RollupOptions;
	title: string;
}
