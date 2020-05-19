import Module, { AstContext } from '../../Module';
import ClassDeclaration from '../nodes/ClassDeclaration';
import ExportDefaultDeclaration from '../nodes/ExportDefaultDeclaration';
import FunctionDeclaration from '../nodes/FunctionDeclaration';
import Identifier, { IdentifierWithVariable } from '../nodes/Identifier';
import LocalVariable from './LocalVariable';
import UndefinedVariable from './UndefinedVariable';
import Variable from './Variable';

export default class ExportDefaultVariable extends LocalVariable {
	hasId = false;

	// Not initialised during construction
	private originalId: IdentifierWithVariable | null = null;
	private originalVariableAndDeclarationModules: {
		modules: Module[];
		original: Variable;
	} | null = null;

	constructor(
		name: string,
		exportDefaultDeclaration: ExportDefaultDeclaration,
		context: AstContext
	) {
		super(name, exportDefaultDeclaration, exportDefaultDeclaration.declaration, context);
		const declaration = exportDefaultDeclaration.declaration;
		if (
			(declaration instanceof FunctionDeclaration || declaration instanceof ClassDeclaration) &&
			declaration.id
		) {
			this.hasId = true;
			this.originalId = declaration.id;
		} else if (declaration instanceof Identifier) {
			this.originalId = declaration as IdentifierWithVariable;
		}
	}

	addReference(identifier: Identifier) {
		if (!this.hasId) {
			this.name = identifier.name;
		}
	}

	getAssignedVariableName(): string | null {
		return (this.originalId && this.originalId.name) || null;
	}

	getBaseVariableName(): string {
		const original = this.getOriginalVariable();
		if (original === this) {
			return super.getBaseVariableName();
		} else {
			return original.getBaseVariableName();
		}
	}

	getName() {
		const original = this.getOriginalVariable();
		if (original === this) {
			return super.getName();
		} else {
			return original.getName();
		}
	}

	getOriginalVariable(): Variable {
		return this.getOriginalVariableAndDeclarationModules().original;
	}

	getOriginalVariableAndDeclarationModules(): { modules: Module[]; original: Variable } {
		if (this.originalVariableAndDeclarationModules === null) {
			if (
				!this.originalId ||
				(!this.hasId &&
					(this.originalId.variable.isReassigned ||
						this.originalId.variable instanceof UndefinedVariable))
			) {
				this.originalVariableAndDeclarationModules = { modules: [], original: this };
			} else {
				const assignedOriginal = this.originalId.variable;
				if (assignedOriginal instanceof ExportDefaultVariable) {
					const { modules, original } = assignedOriginal.getOriginalVariableAndDeclarationModules();
					this.originalVariableAndDeclarationModules = {
						modules: modules.concat(this.module),
						original
					};
				} else {
					this.originalVariableAndDeclarationModules = {
						modules: [this.module],
						original: assignedOriginal
					};
				}
			}
		}
		return this.originalVariableAndDeclarationModules;
	}
}
