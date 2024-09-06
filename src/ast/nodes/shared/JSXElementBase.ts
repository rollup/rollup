import type { NormalizedJsxOptions } from '../../../rollup/types';
import { getRenderedJsxChildren } from '../../../utils/jsx';
import type { InclusionContext } from '../../ExecutionContext';
import type Variable from '../../variables/Variable';
import type { JSXChild, JsxMode } from './jsxHelpers';
import { getAndIncludeFactoryVariable } from './jsxHelpers';
import type { IncludeChildren } from './Node';
import { NodeBase } from './Node';

export default class JSXElementBase extends NodeBase {
	children!: JSXChild[];

	protected factoryVariable: Variable | null = null;
	protected factory: string | null = null;
	protected declare jsxMode: JsxMode;

	initialise() {
		super.initialise();
		const { importSource } = (this.jsxMode = this.getRenderingMode());
		if (importSource) {
			this.scope.context.addImportSource(importSource);
		}
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
		if (!this.included) {
			const { factory, importSource, mode } = this.jsxMode;
			if (factory) {
				this.factory = factory;
				this.factoryVariable = getAndIncludeFactoryVariable(
					factory,
					mode === 'preserve',
					importSource,
					this
				);
			}
		}
		super.include(context, includeChildrenRecursively);
	}

	protected applyDeoptimizations() {}

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
}
