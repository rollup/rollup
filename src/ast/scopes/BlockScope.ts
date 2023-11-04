import type { AstContext } from '../../Module';
import type Identifier from '../nodes/Identifier';
import type { ExpressionEntity } from '../nodes/shared/Expression';
import { VariableKind } from '../nodes/shared/VariableKinds';
import type LocalVariable from '../variables/LocalVariable';
import ChildScope from './ChildScope';

export default class BlockScope extends ChildScope {
	addDeclaration(
		identifier: Identifier,
		context: AstContext,
		init: ExpressionEntity,
		kind: VariableKind
	): LocalVariable {
		// TODO Lukas find a way to add the variable to all scopes
		if (kind === VariableKind.var) {
			const variable = this.parent.addDeclaration(identifier, context, init, kind);
			// Necessary to make sure the init is deoptimized for conditional declarations.
			// We cannot call deoptimizePath here.
			variable.markInitializersForDeoptimization();
			return variable;
		} else {
			return super.addDeclaration(identifier, context, init, kind);
		}
	}
}
