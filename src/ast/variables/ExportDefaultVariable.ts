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

	getName() {
		return this.referencesOriginal() ? this.originalId.variable.getName() : super.getName();
	}

	getOriginalVariable(): Variable | null {
		return (this.originalId && this.originalId.variable) || null;
	}

	getOriginalVariableName(): string | null {
		return (this.originalId && this.originalId.name) || null;
	}

	referencesOriginal() {
		return this.originalId && (this.hasId || !this.originalId.variable.isReassigned);
	}

	setRenderNames(baseName: string | null, name: string | null) {
		if (this.referencesOriginal()) {
			this.originalId.variable.setRenderNames(baseName, name);
		} else {
			super.setRenderNames(baseName, name);
		}
	}

	setSafeName(name: string | null) {
		if (this.referencesOriginal()) {
			this.originalId.variable.setSafeName(name);
		} else {
			super.setSafeName(name);
		}
	}
}

ExportDefaultVariable.prototype.getBaseVariableName = ExportDefaultVariable.prototype.getName;

ExportDefaultVariable.prototype.isDefault = true;
