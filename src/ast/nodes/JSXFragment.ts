import type MagicString from 'magic-string';
import type { NormalizedJsxOptions } from '../../rollup/types';
import { getRenderedJsxChildren } from '../../utils/jsx';
import type { RenderOptions } from '../../utils/renderHelpers';
import type { InclusionContext } from '../ExecutionContext';
import type Variable from '../variables/Variable';
import type JSXClosingFragment from './JSXClosingFragment';
import type JSXElement from './JSXElement';
import JSXEmptyExpression from './JSXEmptyExpression';
import JSXExpressionContainer from './JSXExpressionContainer';
import type JSXOpeningFragment from './JSXOpeningFragment';
import type JSXSpreadChild from './JSXSpreadChild';
import type JSXText from './JSXText';
import type * as NodeType from './NodeType';
import JSXElementBase from './shared/JSXElementBase';
import { type IncludeChildren } from './shared/Node';

export default class JSXFragment extends JSXElementBase {
	type!: NodeType.tJSXElement;
	openingFragment!: JSXOpeningFragment;
	children!: (JSXText | JSXExpressionContainer | JSXSpreadChild | JSXElement | JSXFragment)[];
	closingFragment!: JSXClosingFragment;

	private factory: string | null = null;
	private fragment: string | null = null;
	private factoryVariable: Variable | null = null;
	private fragmentVariable: Variable | null = null;

	// TODO Lukas add import source here
	initialise() {
		super.initialise();
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
		if (!this.included) {
			const { factory, fragment, importSource, mode } = this.getRenderingMode();
			if (importSource) {
				this.scope.context.addImportSource(importSource);
			}
			const preserve = mode === 'preserve';
			if (factory) {
				this.factory = factory;
				this.factoryVariable = this.getAndIncludeFactoryVariable(factory, preserve, importSource);
			}
			if (fragment != null) {
				this.fragment = fragment;
				this.fragmentVariable = this.getAndIncludeFactoryVariable(fragment, preserve, importSource);
			}
		}
		super.include(context, includeChildrenRecursively);
	}

	render(code: MagicString, options: RenderOptions): void {
		const { mode } = this.scope.context.options.jsx as NormalizedJsxOptions;
		if (mode === 'preserve') {
			super.render(code, options);
		} else {
			const {
				snippets: { getPropertyAccess },
				useOriginalName
			} = options;
			const [, ...nestedFactory] = this.factory!.split('.');
			const [, ...nestedFragment] = this.fragment!.split('.');
			const factory = [
				this.factoryVariable!.getName(getPropertyAccess, useOriginalName),
				...nestedFactory
			].join('.');
			const fragment = [
				this.fragmentVariable!.getName(getPropertyAccess, useOriginalName),
				...nestedFragment
			].join('.');
			code.update(
				this.openingFragment.start,
				this.openingFragment.end,
				`/*#__PURE__*/${factory}(${fragment}, `
			);
			this.openingFragment.render(code, options);
			if (mode === 'classic') {
				code.appendLeft(this.openingFragment.end, 'null');
			} else {
				code.appendLeft(this.openingFragment.end, '{');
				const renderedChildren = getRenderedJsxChildren(this.children);
				if (renderedChildren > 0) {
					code.appendLeft(
						this.openingFragment.end,
						` children: ${renderedChildren > 1 ? '[' : ''}`
					);
				}
				code.prependRight(
					this.closingFragment.start,
					`${renderedChildren > 1 ? '] ' : renderedChildren > 0 ? ' ' : ''}}`
				);
			}
			let prependComma = mode === 'classic';
			for (const child of this.children) {
				if (
					child instanceof JSXExpressionContainer &&
					child.expression instanceof JSXEmptyExpression
				) {
					code.remove(child.start, child.end);
				} else {
					child.render(code, options);
					if (prependComma) {
						code.appendLeft(child.start, `, `);
					} else {
						prependComma = true;
					}
				}
			}
			this.closingFragment?.render(code);
		}
	}

	private getRenderingMode(): {
		mode: 'preserve' | 'classic' | 'automatic';
		factory: string | null;
		fragment: string | null;
		importSource: string | null;
	} {
		const jsx = this.scope.context.options.jsx as NormalizedJsxOptions;
		const { mode, factory, importSource } = jsx;
		if (mode === 'automatic') {
			return {
				factory: getRenderedJsxChildren(this.children) > 1 ? 'jsxs' : 'jsx',
				fragment: 'Fragment',
				importSource: jsx.jsxImportSource,
				mode
			};
		}
		return { factory, fragment: jsx.fragment, importSource, mode };
	}
}
