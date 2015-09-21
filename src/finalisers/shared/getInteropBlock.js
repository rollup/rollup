export default function getInteropBlock ( bundle ) {
	return bundle.externalModules
		.map( module => {
			const def = module.exports.lookup( 'default' );

			if ( !def ) return;

			return ( module.needsNamed ? 'var ' : '' ) +
				`${def.name} = 'default' in ${module.name} ? ${module.name}['default'] : ${module.name};`;
		})
		.filter( Boolean )
		.join( '\n' );
}
