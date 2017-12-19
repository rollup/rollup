import Scope from '../../scopes/Scope';
import Node from '../../Node';
import MemberExpression from '../MemberExpression';

// TODO tidy this up a bit (e.g. they can both use node.module.imports)
export default function disallowIllegalReassignment (scope: Scope, node: Node) {
	if (node.type === 'MemberExpression' && (<MemberExpression>node).object.type === 'Identifier') {
		const variable = scope.findVariable((<MemberExpression>node).object.name);
		if (variable.isNamespace) {
			node.module.error(
				{
					code: 'ILLEGAL_NAMESPACE_REASSIGNMENT',
					message: `Illegal reassignment to import '${(<MemberExpression>node).object.name}'`
				},
				node.start
			);
		}
	} else if (node.type === 'Identifier') {
		if (node.module.imports[node.name] && !scope.contains(node.name)) {
			node.module.error(
				{
					code: 'ILLEGAL_REASSIGNMENT',
					message: `Illegal reassignment to import '${node.name}'`
				},
				node.start
			);
		}
	}
}
