import type { AstContext } from '../../Module';
import type Identifier from '../nodes/Identifier';
import * as NodeType from '../nodes/NodeType';
import type { ExpressionEntity } from '../nodes/shared/Expression';
import { VariableKind } from '../nodes/shared/VariableKinds';
import { UNDEFINED_EXPRESSION } from '../values';
import type LocalVariable from '../variables/LocalVariable';
import ParameterScope from './ParameterScope';

// TODO Lukas remove?
export default class CatchScope extends ParameterScope {
	addDeclaration(
		identifier: Identifier,
		context: AstContext,
		init: ExpressionEntity,
		kind: VariableKind
	): LocalVariable {
		if (kind === VariableKind.var) {
			const existingVariable = this.variables.get(identifier.name) as LocalVariable | undefined;
			if (
				existingVariable &&
				existingVariable.kind === VariableKind.parameter &&
				// Only if this is not a destructured variable
				existingVariable.declarations[0].parent.type === NodeType.CatchClause
			) {
				// In this case, the parameter "shadows" the variable locally, creating
				// an "undefined" var outside and mutating the parameter instead here
				//
				// Cf. this example:
				// try {
				// 	throw new Error();
				// } catch {
				// 	var e = 'value';
				// 	console.log(e); // "value"
				// }
				// console.log(e); // undefined
				existingVariable.addDeclaration(identifier, init);
				this.parent.addDeclaration(identifier, context, UNDEFINED_EXPRESSION, kind);
				return existingVariable;
			}
		}
		return super.addDeclaration(identifier, context, init, kind);
	}
}
