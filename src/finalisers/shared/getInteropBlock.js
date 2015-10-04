export default function getInteropBlock ( bundle ) {
	return bundle.externalModules
		.map( module => {
			return module.declarations.default ?
				( module.exportsNames ?
					`var ${module.name}__default = 'default' in ${module.name} ? ${module.name}['default'] : ${module.name};` :
					`${module.name} = 'default' in ${module.name} ? ${module.name}['default'] : ${module.name};` ) :
				null;
		})
		.filter( Boolean )
		.join( '\n' );
}
