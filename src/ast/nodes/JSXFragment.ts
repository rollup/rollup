import type MagicString from 'magic-string';
import type { RenderOptions } from '../../utils/renderHelpers';
import type { InclusionContext } from '../ExecutionContext';
import type JSXClosingFragment from './JSXClosingFragment';
import type JSXOpeningFragment from './JSXOpeningFragment';
import type * as NodeType from './NodeType';
import JSXElementBase from './shared/JSXElementBase';
import type { JSXChild } from './shared/jsxHelpers';
import type { IncludeChildren } from './shared/Node';

export default class JSXFragment extends JSXElementBase {
	declare type: NodeType.tJSXElement;
	declare openingFragment: JSXOpeningFragment;
	declare children: JSXChild[];
	declare closingFragment: JSXClosingFragment;

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
		super.include(context, includeChildrenRecursively);
		this.openingFragment.include(context, includeChildrenRecursively);
		this.closingFragment.include(context, includeChildrenRecursively);
	}

	render(code: MagicString, options: RenderOptions): void {
		switch (this.jsxMode.mode) {
			case 'classic': {
				this.renderClassicMode(code, options);
				break;
			}
			case 'automatic': {
				this.renderAutomaticMode(code, options);
				break;
			}
			default: {
				super.render(code, options);
			}
		}
	}

	private renderClassicMode(code: MagicString, options: RenderOptions) {
		const {
			snippets: { getPropertyAccess },
			useOriginalName
		} = options;
		const { closingFragment, factory, factoryVariable, openingFragment, start } = this;
		const [, ...nestedName] = factory!.split('.');
		openingFragment.render(code, options);
		code.prependRight(
			start,
			`/*#__PURE__*/${[
				factoryVariable!.getName(getPropertyAccess, useOriginalName),
				...nestedName
			].join('.')}(`
		);
		code.appendLeft(openingFragment.end, ', null');

		this.renderChildren(code, options, openingFragment.end);

		closingFragment.render(code, options);
	}

	private renderAutomaticMode(code: MagicString, options: RenderOptions) {
		const {
			snippets: { getPropertyAccess },
			useOriginalName
		} = options;
		const { closingFragment, factoryVariable, openingFragment, start } = this;
		openingFragment.render(code, options);
		code.prependRight(
			start,
			`/*#__PURE__*/${factoryVariable!.getName(getPropertyAccess, useOriginalName)}(`
		);

		const { firstChild, hasMultipleChildren, childrenEnd } = this.renderChildren(
			code,
			options,
			openingFragment.end
		);

		if (firstChild) {
			code.prependRight(firstChild.start, `{ children: ${hasMultipleChildren ? '[' : ''}`);
			if (hasMultipleChildren) {
				code.appendLeft(closingFragment.start, ']');
			}
			code.appendLeft(childrenEnd, ' }');
		} else {
			code.appendLeft(openingFragment.end, ', {}');
		}

		closingFragment.render(code, options);
	}
}
