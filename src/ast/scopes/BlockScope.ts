import type { AstContext } from '../../Module';
import { logRedeclarationError } from '../../utils/logs';
import type Identifier from '../nodes/Identifier';
import type { ExpressionEntity } from '../nodes/shared/Expression';
import type { VariableKind } from '../nodes/shared/VariableKinds';
import type LocalVariable from '../variables/LocalVariable';
import ChildScope from './ChildScope';

export default class BlockScope extends ChildScope {
	constructor(parent: ChildScope) {
		super(parent, parent.context);
	}

	addDeclaration(
		identifier: Identifier,
		context: AstContext,
		init: ExpressionEntity,
		kind: VariableKind
	): LocalVariable {
		if (kind === 'var') {
			const name = identifier.name;
			const existingVariable =
				this.hoistedVariables?.get(name) || (this.variables.get(name) as LocalVariable | undefined);
			if (existingVariable) {
				if (
					existingVariable.kind === 'var' ||
					(kind === 'var' && existingVariable.kind === 'parameter')
				) {
					existingVariable.addDeclaration(identifier, init);
					return existingVariable;
				}
				return context.error(logRedeclarationError(name), identifier.start);
			}
			const declaredVariable = this.parent.addDeclaration(identifier, context, init, kind);
			// Necessary to make sure the init is deoptimized for conditional declarations.
			// We cannot call deoptimizePath here.
			declaredVariable.markInitializersForDeoptimization();
			// We add the variable to this and all parent scopes to reliably detect conflicts
			this.addHoistedVariable(name, declaredVariable);
			return declaredVariable;
		}
		return super.addDeclaration(identifier, context, init, kind);
	}
}
