export interface RollupError extends Error {

}

export default function error (props: Error | RollupError) {
	// use the same constructor as props (if it's an error object)
	// so that err.name is preserved etc
	// (Object.keys below does not update these values because they
	// are properties on the prototype chain)
	// basically if props is a SyntaxError it will not be overriden as a generic Error
	const constructor: Error = props instanceof Error ? <Error>(props.constructor) : Error;
	const err = new constructor(props.message);

	Object.keys(props).forEach(key => {
		(<any>err)[key] = props[key];
	});

	throw err;
}
