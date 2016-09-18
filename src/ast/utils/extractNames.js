export default function extractNames ( param ) {
	const names = [];
	extractors[ param.type ]( names, param );
	return names;
}

const extractors = {
	Identifier ( names, param ) {
		names.push( param.name );
	},

	ObjectPattern ( names, param ) {
		param.properties.forEach( prop => {
			extractors[ prop.value.type ]( names, prop.value );
		});
	},

	ArrayPattern ( names, param ) {
		param.elements.forEach( element => {
			if ( element ) extractors[ element.type ]( names, element );
		});
	},

	RestElement ( names, param ) {
		extractors[ param.argument.type ]( names, param.argument );
	},

	AssignmentPattern ( names, param ) {
		extractors[ param.left.type ]( names, param.left );
	}
};
