import type { InclusionContext } from '../ExecutionContext';
import LocalVariable from '../variables/LocalVariable';
import type Variable from '../variables/Variable';
import type JSXClosingElement from './JSXClosingElement';
import type JSXExpressionContainer from './JSXExpressionContainer';
import type JSXFragment from './JSXFragment';
import type JSXOpeningElement from './JSXOpeningElement';
import type JSXText from './JSXText';
import type * as NodeType from './NodeType';
import type { InclusionOptions } from './shared/Expression';
import type { IncludeChildren } from './shared/Node';
import { NodeBase } from './shared/Node';

export default class JSXElement extends NodeBase {
	type!: NodeType.tJSXElement;
	openingElement!: JSXOpeningElement;
	closingElement!: JSXClosingElement | null;
	children!: (
		| JSXText
		| JSXExpressionContainer
		| JSXElement
		| JSXFragment
	) /* TODO | JSXSpreadChild */[];
	private factoryVariables = new Map<string, Variable>();

	bind() {
		super.bind();
		const { jsx } = this.scope.context.options;
		if (jsx && jsx.preserve) {
			for (const name of jsx.factoryGlobals) {
				this.factoryVariables.set(name, this.scope.findVariable(name));
			}
		}
	}

	include(
		context: InclusionContext,
		includeChildrenRecursively: IncludeChildren,
		options?: InclusionOptions
	): void {
		if (!this.deoptimized) this.applyDeoptimizations();
		if (!this.included) {
			const { jsx } = this.scope.context.options;
			if (jsx && jsx.preserve) {
				// TODO can we rework this so that we throw when different JSX elements would use different React variables?
				for (const [name, factoryVariable] of this.factoryVariables) {
					// This pretends we are accessing an included global variable of the same name
					const globalVariable = this.scope.findGlobal(name);
					globalVariable.include();
					// This excludes this variable from renaming
					factoryVariable.globalName = name;
					this.scope.context.includeVariableInModule(factoryVariable);
				}
			}
		}
		super.include(context, includeChildrenRecursively, options);
	}

	protected applyDeoptimizations(): void {
		this.deoptimized = true;
		for (const factoryVariable of this.factoryVariables.values()) {
			if (factoryVariable instanceof LocalVariable) {
				factoryVariable.consolidateInitializers();
				factoryVariable.addUsedPlace(this);
				this.scope.context.requestTreeshakingPass();
			}
		}
	}
}
