import type MagicString from 'magic-string';
import type { NormalizedJsxOptions } from '../../rollup/types';
import type { RenderOptions } from '../../utils/renderHelpers';
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
		const jsx = this.scope.context.options.jsx as NormalizedJsxOptions;
		if (jsx.preserve) {
			for (const name of jsx.factoryGlobals) {
				this.factoryVariables.set(name, this.scope.findVariable(name));
			}
		} else if (jsx.importSource) {
			const factoryBaseName = jsx.factory.split('.')[0];
			this.factoryVariables.set(
				factoryBaseName,
				this.scope.context.getImportedJsxFactoryVariable(factoryBaseName, this.start)
			);
		} else {
			// TODO handle non-imported
			throw new Error('TODO');
		}
	}

	include(
		context: InclusionContext,
		includeChildrenRecursively: IncludeChildren,
		options?: InclusionOptions
	): void {
		if (!this.deoptimized) this.applyDeoptimizations();
		if (!this.included) {
			const jsx = this.scope.context.options.jsx as NormalizedJsxOptions;
			if (jsx.preserve) {
				// TODO can we rework this so that we throw when different JSX elements would use different React variables?
				for (const [name, factoryVariable] of this.factoryVariables) {
					// This pretends we are accessing an included global variable of the same name
					const globalVariable = this.scope.findGlobal(name);
					globalVariable.include();
					// This excludes this variable from renaming
					factoryVariable.globalName = name;
					this.scope.context.includeVariableInModule(factoryVariable);
				}
			} else if (jsx.importSource) {
				for (const factoryVariable of this.factoryVariables.values()) {
					this.scope.context.includeVariableInModule(factoryVariable);
				}
			} else {
				// TODO handle non-imported
				throw new Error('TODO');
			}
		}
		super.include(context, includeChildrenRecursively, options);
	}

	initialise(): void {
		super.initialise();
		this.scope.context.addJsx();
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

	render(code: MagicString, options: RenderOptions): void {
		super.render(code, options);
		const jsx = this.scope.context.options.jsx as NormalizedJsxOptions;
		if (!jsx.preserve) {
			// TODO import
			code.overwrite(this.start, this.openingElement.name.start, `/*#__PURE__*/${jsx.factory}(`, {
				contentOnly: true
			});
			code.overwrite(this.openingElement.name.end, this.end, `, null)`, { contentOnly: true });
		}
	}
}
