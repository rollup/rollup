export interface RollupError {
	message: string;
	code?: string;
	name?: string;
	url?: string;
	id?: string;
	loc?: {
		file?: string;
		line: number;
		column: number;
	};
	stack?: string;
	frame?: string;
	pos?: number;
	plugin?: string;
	pluginCode?: string;
}

export default function error(props: Error | RollupError) {
	if (props instanceof Error) throw props;

	const err = new Error(props.message);

	Object.keys(props).forEach(key => {
		(<any>err)[key] = (<any>props)[key];
	});

	throw err;
}
