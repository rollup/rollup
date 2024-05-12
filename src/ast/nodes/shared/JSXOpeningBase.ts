import type { NormalizedJsxOptions } from '../../../rollup/types';
import type { InclusionContext } from '../../ExecutionContext';
import LocalVariable from '../../variables/LocalVariable';
import type Variable from '../../variables/Variable';
import type { InclusionOptions } from './Expression';
import { type IncludeChildren, NodeBase } from './Node';

export default class JSXOpeningBase extends NodeBase {
	protected factoryVariable: Variable | null = null;

	include(
		context: InclusionContext,
		includeChildrenRecursively: IncludeChildren,
		options?: InclusionOptions
	): void {
		if (!this.deoptimized) this.applyDeoptimizations();
		if (!this.included) {
			const { factory, importSource, preserve } = this.scope.context.options
				.jsx as NormalizedJsxOptions;
			if (factory != null) {
				this.factoryVariable = this.getAndIncludeFactoryVariable(factory, preserve, importSource);
			}
		}
		super.include(context, includeChildrenRecursively, options);
	}

	initialise(): void {
		super.initialise();
		this.scope.context.addJsx();
	}

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
				this.start
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
}
