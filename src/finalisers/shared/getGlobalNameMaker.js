export default function getGlobalNameMaker ( globals, onwarn ) {
	const fn = typeof globals === 'function' ? globals : id => globals[ id ];

	return function ( module ) {
		const name = fn( module.id );
		if ( name ) return name;

		onwarn( `No name was provided for external module '${module.id}' in options.globals – guessing '${module.name}'` );
		return module.name;
	};
}
