export interface Module {
	code: string;
	isEntry: boolean;
	name: string;
}

export interface Example {
	id: string;
	modules: Module[];
	title: string;
}
