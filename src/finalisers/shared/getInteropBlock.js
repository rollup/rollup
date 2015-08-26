export default function getInteropBlock ( bundle ) {
	return bundle.externalModules
		.map( module => {
			if ( !module.needsDefault ) return;

			if ( module.needsNamed ) {
				return `var ${module.name}__default = 'default' in ${module.name} ? ${module.name}['default'] : ${module.name};`;
			} else {
				return `${module.name} = 'default' in ${module.name} ? ${module.name}['default'] : ${module.name};`;
			}
		})
		.filter( Boolean )
		.join( '\n' );
}
