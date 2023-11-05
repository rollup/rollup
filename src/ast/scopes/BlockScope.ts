import type { AstContext } from '../../Module';
import { logRedeclarationError } from '../../utils/logs';
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
		if (kind === VariableKind.var) {
			const name = identifier.name;
			let variable = this.variables.get(name) as LocalVariable | undefined;
			if (variable) {
				if (variable.kind !== VariableKind.var && variable.kind !== VariableKind.function) {
					context.error(logRedeclarationError(name), identifier.start);
				}
				variable.addDeclaration(identifier, init);
			} else {
				// We add the variable to this and all parent scopes to reliably detect conflicts
				variable = this.parent.addDeclaration(identifier, context, init, kind);
				this.variables.set(name, variable);
			}
			// Necessary to make sure the init is deoptimized for conditional declarations.
			// We cannot call deoptimizePath here.
			variable.markInitializersForDeoptimization();
			return variable;
		} else {
			return super.addDeclaration(identifier, context, init, kind);
		}
	}
}
