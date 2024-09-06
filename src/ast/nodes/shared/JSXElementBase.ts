import type { InclusionContext } from '../../ExecutionContext';
import LocalVariable from '../../variables/LocalVariable';
import type Variable from '../../variables/Variable';
import type { IncludeChildren } from './Node';
import { NodeBase } from './Node';

type JsxMode =
	| {
			mode: 'preserve' | 'classic';
			factory: string | null;
			importSource: string | null;
	  }
	| { mode: 'automatic'; factory: string; importSource: string };

export default abstract class JSXElementBase extends NodeBase {
	protected factoryVariable: Variable | null = null;
	protected factory: string | null = null;
	protected declare jsxMode: JsxMode;

	initialise() {
		super.initialise();
		const { importSource } = (this.jsxMode = this.getRenderingMode());
		if (importSource) {
			this.scope.context.addImportSource(importSource);
		}
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
		if (!this.included) {
			const { factory, importSource, mode } = this.jsxMode;
			if (factory) {
				this.factory = factory;
				this.factoryVariable = this.getAndIncludeFactoryVariable(
					factory,
					mode === 'preserve',
					importSource
				);
			}
		}
		super.include(context, includeChildrenRecursively);
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

	protected abstract getRenderingMode(): JsxMode;
}
