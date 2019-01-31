import { AstContext } from '../../Module';
import { toBase64 } from '../../utils/base64';
import Identifier from '../nodes/Identifier';
import { ExpressionEntity } from '../nodes/shared/Expression';
import { UNDEFINED_EXPRESSION } from '../values';
import ArgumentsVariable from '../variables/ArgumentsVariable';
import ExportDefaultVariable from '../variables/ExportDefaultVariable';
import LocalVariable from '../variables/LocalVariable';
import ThisVariable from '../variables/ThisVariable';
import Variable from '../variables/Variable';

export default class Scope {
	variables: {
		this?: ThisVariable | LocalVariable;
		default?: ExportDefaultVariable;
		arguments?: ArgumentsVariable;
		[name: string]: Variable;
	} = Object.create(null);
	children: Scope[] = [];

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

	deshadow(names: Set<string>, children = this.children) {
		for (const key of Object.keys(this.variables)) {
			const declaration = this.variables[key];

			// we can disregard exports.foo etc
			if (declaration.exportName && declaration.isReassigned && !declaration.isId) continue;
			if (declaration.isDefault) continue;

			let name = declaration.getName(true);
			if (!names.has(name)) continue;

			name = declaration.name;
			let deshadowed,
				i = 1;
			do {
				deshadowed = `${name}$$${toBase64(i++)}`;
			} while (names.has(deshadowed));

			declaration.setSafeName(deshadowed);
		}

		for (const scope of children) scope.deshadow(names);
	}

	findVariable(_name: string): Variable {
		throw new Error('Internal Error: findVariable needs to be implemented by a subclass');
	}
}
