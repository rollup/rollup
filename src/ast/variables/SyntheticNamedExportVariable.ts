import Module, { AstContext } from '../../Module';
import { getOrCreate } from '../../utils/getOrCreate';
import { RESERVED_NAMES } from '../../utils/reservedNames';
import ExportDefaultVariable from './ExportDefaultVariable';
import Variable from './Variable';

// TODO Lukas for circular dependency-aware imports, we need to put
//  a property not on the base/original variable but the used variable,
//  indicating from where the base variable should be imported
export default class SyntheticNamedExportVariable extends Variable {
	context: AstContext;
	module: Module;
	syntheticNamespace: Variable;

	constructor(context: AstContext, name: string, syntheticNamespace: Variable) {
		super(name);
		this.context = context;
		this.module = context.module;
		this.syntheticNamespace = syntheticNamespace;
	}

	getBaseVariable(importer?: Module): Variable {
		let baseVariable = this.syntheticNamespace;
		if (baseVariable instanceof ExportDefaultVariable) {
			baseVariable = baseVariable.getOriginalVariable(importer);
		}
		if (baseVariable instanceof SyntheticNamedExportVariable) {
			baseVariable = baseVariable.getBaseVariable(importer);
		}
		if (importer) {
			const sideEffectModules = getOrCreate(
				baseVariable.sideEffectModulesByImporter,
				importer,
				() => new Set()
			);
			sideEffectModules.add(this.module);
			const currentSideEffectModules = this.sideEffectModulesByImporter.get(importer);
			if (currentSideEffectModules) {
				for (const module of currentSideEffectModules) {
					sideEffectModules.add(module);
				}
			}
		}
		return baseVariable;
	}

	getBaseVariableName(): string {
		return this.syntheticNamespace.getBaseVariableName();
	}

	getName(): string {
		const name = this.name;
		return `${this.syntheticNamespace.getName()}${getPropertyAccess(name)}`;
	}

	include() {
		if (!this.included) {
			this.included = true;
			this.context.includeVariable(this.syntheticNamespace);
		}
	}

	setRenderNames(baseName: string | null, name: string | null) {
		super.setRenderNames(baseName, name);
	}
}

const getPropertyAccess = (name: string) => {
	return !RESERVED_NAMES[name] && /^(?!\d)[\w$]+$/.test(name)
		? `.${name}`
		: `[${JSON.stringify(name)}]`;
};
