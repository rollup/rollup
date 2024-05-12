import type MagicString from 'magic-string';
import type { NormalizedJsxOptions } from '../../rollup/types';
import type { RenderOptions } from '../../utils/renderHelpers';
import type { InclusionContext } from '../ExecutionContext';
import LocalVariable from '../variables/LocalVariable';
import type Variable from '../variables/Variable';
import type * as NodeType from './NodeType';
import type { InclusionOptions } from './shared/Expression';
import { type IncludeChildren, NodeBase } from './shared/Node';

export default class JSXOpeningFragment extends NodeBase {
	type!: NodeType.tJSXOpeningElement;
	attributes!: never[];
	selfClosing!: false;

	private factoryVariable: Variable | null = null;
	private fragmentVariable: Variable | null = null;

	include(
		context: InclusionContext,
		includeChildrenRecursively: IncludeChildren,
		options?: InclusionOptions
	): void {
		if (!this.deoptimized) this.applyDeoptimizations();
		if (!this.included) {
			const { factory, fragmentFactory, importSource, preserve } = this.scope.context.options
				.jsx as NormalizedJsxOptions;
			if (factory != null) {
				this.factoryVariable = this.getAndIncludeFactoryVariable(factory, preserve, importSource);
			}
			if (fragmentFactory != null) {
				this.fragmentVariable = this.getAndIncludeFactoryVariable(
					fragmentFactory,
					preserve,
					importSource
				);
			}
		}
		super.include(context, includeChildrenRecursively, options);
	}

	initialise(): void {
		super.initialise();
		this.scope.context.addJsx();
	}

	render(code: MagicString, options: RenderOptions): void {
		super.render(code, options);
		const {
			snippets: { getPropertyAccess },
			useOriginalName
		} = options;
		const { factory, fragmentFactory, preserve } = this.scope.context.options
			.jsx as NormalizedJsxOptions;
		if (!preserve) {
			const [, ...nestedFactory] = factory.split('.');
			const [, ...nestedFragment] = fragmentFactory.split('.');
			code.overwrite(
				this.start,
				this.end,
				`/*#__PURE__*/${[this.factoryVariable!.getName(getPropertyAccess, useOriginalName), ...nestedFactory].join('.')}(${[this.fragmentVariable!.getName(getPropertyAccess, useOriginalName), ...nestedFragment].join('.')}, null`,
				{ contentOnly: true }
			);
		}
	}

	private getAndIncludeFactoryVariable(
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
