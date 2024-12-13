import type MagicString from 'magic-string';
import type { NormalizedJsxOptions } from '../../rollup/types';
import type { RenderOptions } from '../../utils/renderHelpers';
import type { InclusionContext } from '../ExecutionContext';
import type Variable from '../variables/Variable';
import type * as NodeType from './NodeType';
import { getAndIncludeFactoryVariable } from './shared/jsxHelpers';
import { NodeBase } from './shared/Node';

export default class JSXOpeningFragment extends NodeBase {
	type!: NodeType.tJSXOpeningElement;
	attributes!: never[];
	selfClosing!: false;

	private fragment: string | null = null;
	private fragmentVariable: Variable | null = null;

	includeNode(context: InclusionContext) {
		this.included = true;
		if (!this.deoptimized) this.applyDeoptimizations();
		const jsx = this.scope.context.options.jsx as NormalizedJsxOptions;
		if (jsx.mode === 'automatic') {
			this.fragment = 'Fragment';
			this.fragmentVariable = getAndIncludeFactoryVariable(
				'Fragment',
				false,
				jsx.jsxImportSource,
				this,
				context
			);
		} else {
			const { fragment, importSource, mode } = jsx;
			if (fragment != null) {
				this.fragment = fragment;
				this.fragmentVariable = getAndIncludeFactoryVariable(
					fragment,
					mode === 'preserve',
					importSource,
					this,
					context
				);
			}
		}
	}

	render(code: MagicString, options: RenderOptions): void {
		const { mode } = this.scope.context.options.jsx as NormalizedJsxOptions;
		if (mode !== 'preserve') {
			const {
				snippets: { getPropertyAccess },
				useOriginalName
			} = options;
			const [, ...nestedFragment] = this.fragment!.split('.');
			const fragment = [
				this.fragmentVariable!.getName(getPropertyAccess, useOriginalName),
				...nestedFragment
			].join('.');
			code.update(this.start, this.end, fragment);
		}
	}
}
