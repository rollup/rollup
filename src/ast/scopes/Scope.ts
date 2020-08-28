import { AstContext } from '../../Module';
import Identifier from '../nodes/Identifier';
import { ExpressionEntity } from '../nodes/shared/Expression';
import { UNDEFINED_EXPRESSION } from '../values';
import LocalVariable from '../variables/LocalVariable';
import Variable from '../variables/Variable';
import ChildScope from './ChildScope';

export default class Scope {
	children: ChildScope[] = [];
	variables = new Map<string, Variable>();

	addDeclaration(
		identifier: Identifier,
		context: AstContext,
		init: ExpressionEntity | null,
		_isHoisted: boolean
	) {
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
