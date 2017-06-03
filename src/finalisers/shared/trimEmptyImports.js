export default function trimEmptyImports ( modules ) {
	let i = modules.length;

	while ( i-- ) {
		const module = modules[i];
		if ( Object.keys( module.declarations ).length > 0 ) {
			return modules.slice( 0, i + 1 );
		}
	}

	return [];
}
