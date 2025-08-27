import type MagicString from 'magic-string';
import type { NormalizedJsxOptions } from '../../../rollup/types';
import { getRenderedJsxChildren } from '../../../utils/jsx';
import type { RenderOptions } from '../../../utils/renderHelpers';
import type { InclusionContext } from '../../ExecutionContext';
import type Variable from '../../variables/Variable';
import JSXEmptyExpression from '../JSXEmptyExpression';
import JSXExpressionContainer from '../JSXExpressionContainer';
import JSXText from '../JSXText';
import type { JSXChild, JsxMode } from './jsxHelpers';
import { getAndIncludeFactoryVariable } from './jsxHelpers';
import type { IncludeChildren } from './Node';
import { doNotDeoptimize, NodeBase } from './Node';

export default class JSXElementBase extends NodeBase {
	children!: JSXChild[];

	protected factoryVariable: Variable | null = null;
	protected factory: string | null = null;
	declare protected jsxMode: JsxMode;

	initialise() {
		super.initialise();
		const { importSource } = (this.jsxMode = this.getRenderingMode());
		if (importSource) {
			this.scope.context.addImportSource(importSource);
		}
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
		if (!this.included) this.includeNode(context);
		for (const child of this.children) {
			child.include(context, includeChildrenRecursively);
		}
	}

	includeNode(context: InclusionContext) {
		this.included = true;
		const { factory, importSource, mode } = this.jsxMode;
		if (factory) {
			this.factory = factory;
			this.factoryVariable = getAndIncludeFactoryVariable(
				factory,
				mode === 'preserve',
				importSource,
				this,
				context
			);
		}
	}

	protected getRenderingMode(): JsxMode {
		const jsx = this.scope.context.options.jsx as NormalizedJsxOptions;
		const { mode, factory, importSource } = jsx;
		if (mode === 'automatic') {
			return {
				factory: getRenderedJsxChildren(this.children) > 1 ? 'jsxs' : 'jsx',
				importSource: jsx.jsxImportSource,
				mode
			};
		}
		return { factory, importSource, mode };
	}

	protected renderChildren(code: MagicString, options: RenderOptions, openingEnd: number) {
		const { children } = this;
		let hasMultipleChildren = false;
		let childrenEnd = openingEnd;
		let firstChild: JSXChild | null = null;
		for (const child of children) {
			if (
				(child instanceof JSXExpressionContainer &&
					child.expression instanceof JSXEmptyExpression) ||
				(child instanceof JSXText && !child.shouldRender())
			) {
				code.remove(childrenEnd, child.end);
			} else {
				code.appendLeft(childrenEnd, ', ');
				child.render(code, options);
				if (firstChild) {
					hasMultipleChildren = true;
				} else {
					firstChild = child;
				}
			}
			childrenEnd = child.end;
		}
		return { childrenEnd, firstChild, hasMultipleChildren };
	}
}

JSXElementBase.prototype.applyDeoptimizations = doNotDeoptimize;
