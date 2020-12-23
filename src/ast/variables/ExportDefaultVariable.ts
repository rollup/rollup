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

	getDirectOriginalVariable(): Variable | null {
		return this.originalId &&
			(this.hasId ||
				!(
					this.originalId.variable.isReassigned ||
					this.originalId.variable instanceof UndefinedVariable
				))
			? this.originalId.variable
			: null;
	}

	getName() {
		const original = this.getOriginalVariable();
		if (original === this) {
			return super.getName();
		} else {
			return original.getName();
		}
	}

	// TODO Lukas test and fix infinite loop: Export default import from same module as default
	// TODO Lukas what about synthetic exports here?
	getOriginalVariable(): Variable {
		let original: Variable | null = this;
		let currentVariable: Variable;
		do {
			currentVariable = original;
			original = (currentVariable as ExportDefaultVariable).getDirectOriginalVariable();
		} while (original instanceof ExportDefaultVariable);
		return original || currentVariable;
	}
}
