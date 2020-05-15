import { AstContext } from '../../Module';
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
	private originalVariable: Variable | null = null;

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
		if (this.originalVariable === null) {
			if (
				!this.originalId ||
				(!this.hasId &&
					(this.originalId.variable.isReassigned ||
						this.originalId.variable instanceof UndefinedVariable))
			) {
				this.originalVariable = this;
			} else {
				const assignedOriginal = this.originalId.variable;
				this.originalVariable =
					assignedOriginal instanceof ExportDefaultVariable
						? assignedOriginal.getOriginalVariable()
						: assignedOriginal;
			}
		}
		return this.originalVariable;
	}
}
