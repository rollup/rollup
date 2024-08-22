import LocalVariable from '../../variables/LocalVariable';
import type Variable from '../../variables/Variable';
import { NodeBase } from './Node';

export default class JSXElementBase extends NodeBase {
	protected getAndIncludeFactoryVariable(
		factory: string,
		preserve: boolean,
		importSource: string | null
	): Variable {
		const [baseName, nestedName] = factory.split('.');
		let factoryVariable: Variable;
		if (importSource) {
			factoryVariable = this.scope.context.getImportedJsxFactoryVariable(
				nestedName ? 'default' : baseName,
				this.start,
				importSource
			);
			if (preserve) {
				// This pretends we are accessing an included global variable of the same name
				const globalVariable = this.scope.findGlobal(baseName);
				globalVariable.include();
				// This excludes this variable from renaming
				factoryVariable.globalName = baseName;
			}
		} else {
			factoryVariable = this.scope.findGlobal(baseName);
		}
		this.scope.context.includeVariableInModule(factoryVariable);
		if (factoryVariable instanceof LocalVariable) {
			factoryVariable.consolidateInitializers();
			factoryVariable.addUsedPlace(this);
			this.scope.context.requestTreeshakingPass();
		}
		return factoryVariable;
	}

	protected applyDeoptimizations() {}
}
