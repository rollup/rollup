import Scope from '../../scopes/Scope';
import Node from '../../Node';
import MemberExpression from '../MemberExpression';
import Identifier from '../Identifier';
import NamespaceVariable from '../../variables/NamespaceVariable';

// TODO tidy this up a bit (e.g. they can both use node.module.imports)
export default function disallowIllegalReassignment (scope: Scope, node: Node) {
	if (node.type === 'MemberExpression' && (<MemberExpression>node).object.type === 'Identifier') {
		const identifier = <Identifier>(<MemberExpression>node).object;
		const variable = scope.findVariable(identifier.name);
		if ((<NamespaceVariable>variable).isNamespace) {
			node.module.error(
				{
					code: 'ILLEGAL_NAMESPACE_REASSIGNMENT',
					message: `Illegal reassignment to import '${identifier.name}'`
				},
				node.start
			);
		}
	} else if (node.type === 'Identifier') {
		if (node.module.imports[(<Identifier>node).name] && !scope.contains((<Identifier>node).name)) {
			node.module.error(
				{
					code: 'ILLEGAL_REASSIGNMENT',
					message: `Illegal reassignment to import '${(<Identifier>node).name}'`
				},
				node.start
			);
		}
	}
}
