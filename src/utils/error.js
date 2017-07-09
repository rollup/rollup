export default function error ( props ) {
	// use the same constructor as props (if it's an error object)
	// so that err.name is preserved etc
	// (Object.keys below does not update these values because they
	// are properties on the prototype chain)
	// basically if props is a SyntaxError it will not be overriden as a generic Error
	let constructor = Error;
	if (props instanceof Error) constructor = props.constructor;
	const err = new constructor( props.message );

	Object.keys( props ).forEach( key => {
		err[ key ] = props[ key ];
	});

	throw err;
}
