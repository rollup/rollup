import type { AstContext } from '../../Module';
import { logRedeclarationError } from '../../utils/logs';
import type Identifier from '../nodes/Identifier';
import * as NodeType from '../nodes/NodeType';
import type { ExpressionEntity } from '../nodes/shared/Expression';
import { VariableKind } from '../nodes/shared/VariableKinds';
import type LocalVariable from '../variables/LocalVariable';
import ChildScope from './ChildScope';
import type ParameterScope from './ParameterScope';

export default class CatchBodyScope extends ChildScope {
	constructor(
		readonly parent: ParameterScope,
		readonly context: AstContext
	) {
		super(parent, context);
	}

	addDeclaration(
		identifier: Identifier,
		context: AstContext,
		init: ExpressionEntity,
		kind: VariableKind
	): LocalVariable {
		const name = identifier.name;
		const existingVariable = this.variables.get(name) as LocalVariable | undefined;
		if (
			existingVariable?.kind === VariableKind.parameter &&
			(kind === VariableKind.function ||
				// If this is a destructured parameter, it is forbidden to redeclare
				existingVariable.declarations[0].parent.type !== NodeType.CatchClause)
		) {
			context.error(logRedeclarationError(name), identifier.start);
		}
		if (kind === VariableKind.var) {
			// TODO Lukas handle redeclaration!
			const variable = this.parent.parent.addDeclaration(identifier, context, init, kind);
			this.variables.set(name, variable);
			// We need to ensure the variable name is deconflicted with local names
			this.accessedOutsideVariables.set(name, variable);
			return variable;
		}
		return super.addDeclaration(identifier, context, init, kind);
	}
}
