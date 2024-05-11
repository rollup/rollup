import type MagicString from 'magic-string';
import type { NormalizedJsxOptions } from '../../rollup/types';
import type { RenderOptions } from '../../utils/renderHelpers';
import type { InclusionContext } from '../ExecutionContext';
import LocalVariable from '../variables/LocalVariable';
import type Variable from '../variables/Variable';
import type JSXClosingElement from './JSXClosingElement';
import JSXEmptyExpression from './JSXEmptyExpression';
import JSXExpressionContainer from './JSXExpressionContainer';
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
				const [baseName, nestedName] = factory.split('.');
				if (importSource) {
					this.factoryVariable = this.scope.context.getImportedJsxFactoryVariable(
						nestedName ? 'default' : baseName,
						this.start
					);
					if (preserve) {
						// This pretends we are accessing an included global variable of the same name
						const globalVariable = this.scope.findGlobal(baseName);
						globalVariable.include();
						// This excludes this variable from renaming
						this.factoryVariable.globalName = baseName;
					}
				} else {
					this.factoryVariable = this.scope.findGlobal(baseName);
				}
				this.scope.context.includeVariableInModule(this.factoryVariable);
				if (this.factoryVariable instanceof LocalVariable) {
					this.factoryVariable.consolidateInitializers();
					this.factoryVariable.addUsedPlace(this);
					this.scope.context.requestTreeshakingPass();
				}
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
		const { factory, preserve } = this.scope.context.options.jsx as NormalizedJsxOptions;
		if (!preserve) {
			const [, ...nestedName] = factory.split('.');
			code.overwrite(
				this.start,
				this.openingElement.name.start,
				`/*#__PURE__*/${[this.factoryVariable!.getName(getPropertyAccess, useOriginalName), ...nestedName].join('.')}(`,
				{ contentOnly: true }
			);
			let insertPostion = this.openingElement.name.end;
			// TODO do this in the opening element
			code.appendLeft(insertPostion, `, null`);
			for (const child of this.children) {
				if (
					child instanceof JSXExpressionContainer &&
					child.expression instanceof JSXEmptyExpression
				) {
					code.remove(insertPostion, child.end);
				} else {
					code.overwrite(insertPostion, child.start, `, `, { contentOnly: true });
					insertPostion = child.end;
				}
			}
			code.overwrite(insertPostion, this.end, `)`, { contentOnly: true });
		}
	}
}
