import { locate } from 'locate-character';
import error from '../../../utils/error.js';

// TODO tidy this up a bit (e.g. they can both use node.module.imports)
export default function disallowIllegalReassignment ( scope, node ) {
	if ( node.type === 'MemberExpression' && node.object.type === 'Identifier' ) {
		const declaration = scope.findDeclaration( node.object.name );
		if ( declaration.isNamespace ) {
			error({
				message: `Illegal reassignment to import '${node.object.name}'`,
				file: node.module.id,
				pos: node.start,
				loc: locate( node.module.code, node.start, { offsetLine: 1 })
			});
		}
	}

	else if ( node.type === 'Identifier' ) {
		if ( node.module.imports[ node.name ] && !scope.contains( node.name ) ) {
			error({
				message: `Illegal reassignment to import '${node.name}'`,
				file: node.module.id,
				pos: node.start,
				loc: locate( node.module.code, node.start, { offsetLine: 1 })
			});
		}
	}
}
