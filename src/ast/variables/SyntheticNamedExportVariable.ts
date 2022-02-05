import type Module from '../../Module';
import type { AstContext } from '../../Module';
import ExportDefaultVariable from './ExportDefaultVariable';
import Variable from './Variable';

export default class SyntheticNamedExportVariable extends Variable {
	context: AstContext;
	module: Module;
	syntheticNamespace: Variable;

	private baseVariable: Variable | null = null;

	constructor(context: AstContext, name: string, syntheticNamespace: Variable) {
		super(name);
		this.context = context;
		this.module = context.module;
		this.syntheticNamespace = syntheticNamespace;
	}

	getBaseVariable(): Variable {
		if (this.baseVariable) return this.baseVariable;
		let baseVariable = this.syntheticNamespace;
		while (
			baseVariable instanceof ExportDefaultVariable ||
			baseVariable instanceof SyntheticNamedExportVariable
		) {
			if (baseVariable instanceof ExportDefaultVariable) {
				const original = baseVariable.getOriginalVariable();
				if (original === baseVariable) break;
				baseVariable = original;
			}
			if (baseVariable instanceof SyntheticNamedExportVariable) {
				baseVariable = baseVariable.syntheticNamespace;
			}
		}
		return (this.baseVariable = baseVariable);
	}

	getBaseVariableName(): string {
		return this.syntheticNamespace.getBaseVariableName();
	}

	getName(getPropertyAccess: (name: string) => string): string {
		return `${this.syntheticNamespace.getName(getPropertyAccess)}${getPropertyAccess(this.name)}`;
	}

	include(): void {
		this.included = true;
		this.context.includeVariableInModule(this.syntheticNamespace);
	}

	setRenderNames(baseName: string | null, name: string | null): void {
		super.setRenderNames(baseName, name);
	}
}
