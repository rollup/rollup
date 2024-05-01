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
	private factoryVariable: Variable | null = null;

	bind() {
		super.bind();
		if (this.scope.context.options.jsx === 'preserve') {
			// And also make sure it is always called "react"
			this.factoryVariable = this.scope.findVariable('React');
		}
	}

	include(
		context: InclusionContext,
		includeChildrenRecursively: IncludeChildren,
		options?: InclusionOptions
	): void {
		if (!this.deoptimized) this.applyDeoptimizations();
		if (!this.included && this.factoryVariable !== null) {
			// TODO can we rework this so that we throw when different JSX elements would use different React variables?
			//  This should probably rely on using a different way of specifying "preserve" mode with factory variables
			// This pretends we are accessing a global variable of the same name
			this.scope.findGlobal('React');
			// This excludes this variable from renaming
			this.factoryVariable.globalName = 'React';
			this.scope.context.includeVariableInModule(this.factoryVariable);
		}
		super.include(context, includeChildrenRecursively, options);
	}

	protected applyDeoptimizations(): void {
		this.deoptimized = true;
		if (this.factoryVariable instanceof LocalVariable) {
			this.factoryVariable.consolidateInitializers();
			this.factoryVariable.addUsedPlace(this);
			this.scope.context.requestTreeshakingPass();
		}
	}
}
