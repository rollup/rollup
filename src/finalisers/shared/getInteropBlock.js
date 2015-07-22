export default function getInteropBlock ( bundle ) {
	return bundle.externalModules
		.filter( module => module.needsDefault && module.needsNamed )
		.map( module => `var ${module.name}__default = 'default' in ${module.name} ? ${module.name}['default'] : ${module.name};` )
		.join( '\n' );
}
