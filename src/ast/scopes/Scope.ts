import { toBase64 } from '../../utils/base64';
import ExportDefaultDeclaration from '../nodes/ExportDefaultDeclaration';
import Identifier from '../nodes/Identifier';
import { ExpressionEntity } from '../nodes/shared/Expression';
import { EntityPathTracker } from '../utils/EntityPathTracker';
import { UNDEFINED_EXPRESSION } from '../values';
import ArgumentsVariable from '../variables/ArgumentsVariable';
import ExportDefaultVariable from '../variables/ExportDefaultVariable';
import LocalVariable from '../variables/LocalVariable';
import ThisVariable from '../variables/ThisVariable';
import Variable from '../variables/Variable';

export default class Scope {
	parent: Scope | null;
	variables: {
		this?: ThisVariable | LocalVariable;
		default?: ExportDefaultVariable;
		arguments?: ArgumentsVariable;
		[name: string]: Variable;
	};
	isModuleScope: boolean = false;
	children: Scope[];

	constructor(parent: Scope | null = null) {
		this.parent = parent;
		this.children = [];
		if (this.parent) this.parent.children.push(this);
		this.variables = Object.create(null);
	}

	addDeclaration(
		identifier: Identifier,
		reassignmentTracker: EntityPathTracker,
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
				reassignmentTracker
			);
		}
		return this.variables[name];
	}

	addExportDefaultDeclaration(
		name: string,
		exportDefaultDeclaration: ExportDefaultDeclaration,
		reassignmentTracker: EntityPathTracker
	): ExportDefaultVariable {
		this.variables.default = new ExportDefaultVariable(
			name,
			exportDefaultDeclaration,
			reassignmentTracker
		);
		return this.variables.default;
	}

	addReturnExpression(expression: ExpressionEntity) {
		this.parent && this.parent.addReturnExpression(expression);
	}

	contains(name: string): boolean {
		return name in this.variables || (this.parent ? this.parent.contains(name) : false);
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

	findLexicalBoundary(): Scope {
		return this.parent.findLexicalBoundary();
	}

	findVariable(name: string): Variable {
		return this.variables[name] || (this.parent && this.parent.findVariable(name));
	}
}
