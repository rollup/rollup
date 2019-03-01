import { AstContext } from '../../Module';
import Identifier from '../nodes/Identifier';
import { ExpressionEntity } from '../nodes/shared/Expression';
import { UNDEFINED_EXPRESSION } from '../values';
import ArgumentsVariable from '../variables/ArgumentsVariable';
import ExportDefaultVariable from '../variables/ExportDefaultVariable';
import LocalVariable from '../variables/LocalVariable';
import ThisVariable from '../variables/ThisVariable';
import Variable from '../variables/Variable';
import ChildScope from './ChildScope';

export default class Scope {
	children: ChildScope[] = [];
	variables: {
		[name: string]: Variable;
		arguments?: ArgumentsVariable;
		default?: ExportDefaultVariable;
		this?: ThisVariable | LocalVariable;
	} = Object.create(null);

	addDeclaration(
		identifier: Identifier,
		context: AstContext,
		init: ExpressionEntity | null = null,
		_isHoisted: boolean
	) {
		const name = identifier.name;
		if (this.variables[name]) {
			(<LocalVariable>this.variables[name]).addDeclaration(identifier, init);
		} else {
			this.variables[name] = new LocalVariable(
				identifier.name,
				identifier,
				init || UNDEFINED_EXPRESSION,
				context
			);
		}
		return this.variables[name];
	}

	contains(name: string): boolean {
		return name in this.variables;
	}

	findVariable(_name: string): Variable {
		throw new Error('Internal Error: findVariable needs to be implemented by a subclass');
	}
}
