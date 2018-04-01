import { RollupError } from '../rollup/types';

export default function error(props: Error | RollupError) {
	if (props instanceof Error) throw props;

	const err = new Error(props.message);

	Object.keys(props).forEach(key => {
		(<any>err)[key] = (<any>props)[key];
	});

	throw err;
}
