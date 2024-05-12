import type MagicString from 'magic-string';
import type { NormalizedJsxOptions } from '../../rollup/types';
import type { RenderOptions } from '../../utils/renderHelpers';
import type { InclusionContext } from '../ExecutionContext';
import type Variable from '../variables/Variable';
import type * as NodeType from './NodeType';
import type { InclusionOptions } from './shared/Expression';
import JSXOpeningBase from './shared/JSXOpeningBase';
import { type IncludeChildren } from './shared/Node';

export default class JSXOpeningFragment extends JSXOpeningBase {
	type!: NodeType.tJSXOpeningElement;
	attributes!: never[];
	selfClosing!: false;

	private fragmentVariable: Variable | null = null;

	include(
		context: InclusionContext,
		includeChildrenRecursively: IncludeChildren,
		options?: InclusionOptions
	): void {
		if (!this.included) {
			const { fragmentFactory, importSource, preserve } = this.scope.context.options
				.jsx as NormalizedJsxOptions;
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
}
