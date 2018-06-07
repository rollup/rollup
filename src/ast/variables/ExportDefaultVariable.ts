import ClassDeclaration from '../nodes/ClassDeclaration';
import ExportDefaultDeclaration from '../nodes/ExportDefaultDeclaration';
import FunctionDeclaration from '../nodes/FunctionDeclaration';
import Identifier from '../nodes/Identifier';
import LocalVariable from './LocalVariable';
import Variable from './Variable';

export function isExportDefaultVariable(variable: Variable): variable is ExportDefaultVariable {
	return variable.isDefault;
}

export default class ExportDefaultVariable extends LocalVariable {
	isDefault: true;
	hasId: boolean;

	// Not initialised during construction
	private original: Variable | null = null;

	constructor(name: string, exportDefaultDeclaration: ExportDefaultDeclaration) {
		super(name, exportDefaultDeclaration, exportDefaultDeclaration.declaration);
		this.hasId = !!(<FunctionDeclaration | ClassDeclaration>exportDefaultDeclaration.declaration)
			.id;
	}

	addReference(identifier: Identifier) {
		if (!this.hasId) {
			this.name = identifier.name;
			if (this.original !== null) {
				this.original.addReference(identifier);
			}
		}
	}

	getName(reset?: boolean) {
		if (!reset && this.safeName) return this.safeName;
		if (this.original !== null && !this.original.isReassigned) return this.original.getName();
		return this.name;
	}

	referencesOriginal() {
		return this.original && !this.original.isReassigned;
	}

	getOriginalVariableName() {
		return this.original && this.original.getName();
	}

	setOriginalVariable(original: Variable) {
		this.original = original;
	}
}

ExportDefaultVariable.prototype.isDefault = true;
