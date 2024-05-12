import type MagicString from 'magic-string';
import type { NormalizedJsxOptions } from '../../rollup/types';
import type { RenderOptions } from '../../utils/renderHelpers';
import type { InclusionContext } from '../ExecutionContext';
import LocalVariable from '../variables/LocalVariable';
import type Variable from '../variables/Variable';
import type JSXAttribute from './JSXAttribute';
import type JSXIdentifier from './JSXIdentifier';
import type * as NodeType from './NodeType';
import type { InclusionOptions } from './shared/Expression';
import { type IncludeChildren, NodeBase } from './shared/Node';

export default class JSXOpeningElement extends NodeBase {
	type!: NodeType.tJSXOpeningElement;
	name!: JSXIdentifier;
	attributes!: JSXAttribute /* TODO | JSXSpreadAttribute */[];
	selfClosing!: boolean;

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
				this.name.start,
				`/*#__PURE__*/${[this.factoryVariable!.getName(getPropertyAccess, useOriginalName), ...nestedName].join('.')}(`,
				{ contentOnly: true }
			);
			if (this.attributes.length > 0) {
				code.overwrite(this.name.end, this.attributes[0].start, ', { ', { contentOnly: true });
				for (let index = 0; index < this.attributes.length - 1; index++) {
					code.appendLeft(this.attributes[index].end, ', ');
				}
				code.overwrite(this.attributes.at(-1)!.end, this.end, ' }', {
					contentOnly: true
				});
			} else {
				code.overwrite(this.name.end, this.end, `, null`, {
					contentOnly: true
				});
			}
			if (this.selfClosing) {
				code.appendLeft(this.end, ')');
			}
		}
	}
}
