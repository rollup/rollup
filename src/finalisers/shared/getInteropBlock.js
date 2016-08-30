export default function getInteropBlock ( bundle ) {
	return bundle.externalModules
		.map( module => {
			if ( !module.declarations.default ) return null;

			if ( module.exportsNamespace ) {
				return `${bundle.varOrConst} ${module.name}__default = ${module.name}['default'];`;
			}

			if ( module.exportsNames ) {
				return `${bundle.varOrConst} ${module.name}__default = 'default' in ${module.name} ? ${module.name}['default'] : ${module.name};`;
			}

			return `${module.name} = 'default' in ${module.name} ? ${module.name}['default'] : ${module.name};`;
		})
		.filter( Boolean )
		.join( '\n' );
}
