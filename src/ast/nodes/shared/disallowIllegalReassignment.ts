import Scope from '../../scopes/Scope';
import { Node } from './Node';
import { isMemberExpression } from '../MemberExpression';
import { isIdentifier } from '../Identifier';
import { WritableEntity } from '../../Entity';
import { isNamespaceVariable } from '../../variables/NamespaceVariable';

// TODO tidy this up a bit (e.g. they can both use node.module.imports)
// TODO Lukas inline this
export default function disallowIllegalImportReassignment (scope: Scope, node: WritableEntity & Node) {
	if (isMemberExpression(node) && isIdentifier(node.object)) {
		const identifier = node.object;
		const variable = scope.findVariable(identifier.name);
		if (isNamespaceVariable(variable)) {
			node.module.error(
				{
					code: 'ILLEGAL_NAMESPACE_REASSIGNMENT',
					message: `Illegal reassignment to import '${identifier.name}'`
				},
				node.start
			);
		}
	} else if (isIdentifier(node)) {
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
