export default function error ( props ) {
	const err = new Error( props.message );

	Object.keys( props ).forEach( key => {
		err[ key ] = props[ key ];
	});

	throw err;
}
