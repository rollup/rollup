import { AstContext } from '../../Module';
import ClassDeclaration from '../nodes/ClassDeclaration';
import ExportDefaultDeclaration from '../nodes/ExportDefaultDeclaration';
import FunctionDeclaration from '../nodes/FunctionDeclaration';
import Identifier from '../nodes/Identifier';
import * as NodeType from '../nodes/NodeType';
import LocalVariable from './LocalVariable';
import Variable from './Variable';

export function isExportDefaultVariable(variable: Variable): variable is ExportDefaultVariable {
	return variable.isDefault;
}

export default class ExportDefaultVariable extends LocalVariable {
	isDefault: true;
	hasId: boolean;

	// Not initialised during construction
	private originalId: Identifier | null = null;

	constructor(
		name: string,
		exportDefaultDeclaration: ExportDefaultDeclaration,
		context: AstContext
	) {
		super(name, exportDefaultDeclaration, exportDefaultDeclaration.declaration, context);
		const declaration = exportDefaultDeclaration.declaration;
		if (
			(declaration.type === NodeType.FunctionDeclaration ||
				declaration.type === NodeType.ClassDeclaration) &&
			(<FunctionDeclaration | ClassDeclaration>declaration).id
		) {
			this.hasId = true;
			this.originalId = (<FunctionDeclaration | ClassDeclaration>declaration).id;
		} else if (declaration.type === NodeType.Identifier) {
			this.originalId = <Identifier>declaration;
		}
	}

	addReference(identifier: Identifier) {
		if (!this.hasId) {
			this.name = identifier.name;
		}
	}

	getName(reset?: boolean) {
		if (!reset && this.safeName) return this.safeName;
		if (this.referencesOriginal()) return this.originalId.variable.getName();
		return this.name;
	}

	referencesOriginal() {
		return this.originalId && (this.hasId || !this.originalId.variable.isReassigned);
	}

	getOriginalVariableName(): string | null {
		return (this.originalId && this.originalId.name) || null;
	}
}

ExportDefaultVariable.prototype.isDefault = true;
