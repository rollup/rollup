export function getMethod ( plugins, name ) {
	return plugins.map( plugin => plugin[ name ] ).filter( Boolean );
}

export function executeMethod ( plugins, name, scope, args ) {
	return Promise.all( getMethod( plugins, name ).map( fn => fn.apply( scope, args || [] )));
}
