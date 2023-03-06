import type { AstContext } from '../../Module';
import type Identifier from '../nodes/Identifier';
import type { ExpressionEntity } from '../nodes/shared/Expression';
import { UNDEFINED_EXPRESSION } from '../values';
import LocalVariable from '../variables/LocalVariable';
import type Variable from '../variables/Variable';
import type ChildScope from './ChildScope';

export default class Scope {
	readonly children: ChildScope[] = [];
	readonly variables = new Map<string, Variable>();

	addDeclaration(
		identifier: Identifier,
		context: AstContext,
		init: ExpressionEntity,
		_isHoisted: boolean
	): LocalVariable {
		const name = identifier.name;
		let variable = this.variables.get(name) as LocalVariable;
		if (variable) {
			variable.addDeclaration(identifier, init);
		} else {
			variable = new LocalVariable(
				identifier.name,
				identifier,
				init || UNDEFINED_EXPRESSION,
				context
			);
			this.variables.set(name, variable);
		}
		return variable;
	}

	contains(name: string): boolean {
		return this.variables.has(name);
	}

	findVariable(_name: string): Variable {
		throw new Error('Internal Error: findVariable needs to be implemented by a subclass');
	}
}
