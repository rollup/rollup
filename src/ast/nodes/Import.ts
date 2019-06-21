import MagicString from 'magic-string';
import { findFirstOccurrenceOutsideComment, RenderOptions } from '../../utils/renderHelpers';
import { INTEROP_NAMESPACE_VARIABLE } from '../../utils/variableNames';
import NamespaceVariable from '../variables/NamespaceVariable';
import CallExpression from './CallExpression';
import * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

interface DynamicImportMechanism {
	left: string;
	right: string;
}

export default class Import extends NodeBase {
	parent!: CallExpression;
	type!: NodeType.tImport;

	private exportMode: 'none' | 'named' | 'default' | 'auto' = 'auto';
	private inlineNamespace?: NamespaceVariable;

	include() {
		if (!this.included) {
			this.included = true;
			this.context.includeDynamicImport(this);
		}
	}

	initialise() {
		this.context.addDynamicImport(this);
	}

	render(code: MagicString, options: RenderOptions) {
		if (this.inlineNamespace) {
			const _ = options.compact ? '' : ' ';
			const s = options.compact ? '' : ';';
			code.overwrite(
				this.parent.start,
				this.parent.end,
				`Promise.resolve().then(function${_}()${_}{${_}return ${this.inlineNamespace.getName()}${s}${_}})`
			);
			return;
		}

		const importMechanism = this.getDynamicImportMechanism(options);
		if (importMechanism) {
			code.overwrite(
				this.parent.start,
				findFirstOccurrenceOutsideComment(code.original, '(', this.parent.callee.end) + 1,
				importMechanism.left
			);
			code.overwrite(this.parent.end - 1, this.parent.end, importMechanism.right);
		}
	}

	renderFinalResolution(code: MagicString, resolution: string, format: string) {
		if (this.included) {
			if (format === 'amd' && resolution.startsWith("'.") && resolution.endsWith(".js'")) {
				resolution = resolution.slice(0, -4) + "'";
			}
			code.overwrite(this.parent.arguments[0].start, this.parent.arguments[0].end, resolution);
		}
	}

	setResolution(
		exportMode: 'none' | 'named' | 'default' | 'auto',
		inlineNamespace?: NamespaceVariable
	): void {
		this.exportMode = exportMode;
		if (inlineNamespace) {
			this.inlineNamespace = inlineNamespace;
		} else {
			this.scope.addAccessedGlobalsByFormat({
				amd: ['require'],
				cjs: ['require'],
				system: ['module']
			});
			if (exportMode === 'auto') {
				this.scope.addAccessedGlobalsByFormat({
					amd: [INTEROP_NAMESPACE_VARIABLE],
					cjs: [INTEROP_NAMESPACE_VARIABLE]
				});
			}
		}
	}

	private getDynamicImportMechanism(options: RenderOptions): DynamicImportMechanism | null {
		switch (options.format) {
			case 'cjs': {
				switch (this.exportMode) {
					case 'default':
						const _ = options.compact ? '' : ' ';
						return { left: `Promise.resolve({${_}'default':${_}require(`, right: `)${_}})` };
					case 'auto':
						return { left: `Promise.resolve(${INTEROP_NAMESPACE_VARIABLE}(require(`, right: ')))' };
					default:
						return { left: 'Promise.resolve(require(', right: '))' };
				}
			}
			case 'amd': {
				const _ = options.compact ? '' : ' ';
				const resolve = options.compact ? 'c' : 'resolve';
				const reject = options.compact ? 'e' : 'reject';
				const resolveNamespace =
					this.exportMode === 'default'
						? `function${_}(m)${_}{${_}${resolve}({${_}'default':${_}m${_}});${_}}`
						: this.exportMode === 'auto'
						? `function${_}(m)${_}{${_}${resolve}(${INTEROP_NAMESPACE_VARIABLE}(m));${_}}`
						: resolve;
				return {
					left: `new Promise(function${_}(${resolve},${_}${reject})${_}{${_}require([`,
					right: `],${_}${resolveNamespace},${_}${reject})${_}})`
				};
			}
			case 'system':
				return {
					left: 'module.import(',
					right: ')'
				};
			case 'es':
				if (options.dynamicImportFunction) {
					return {
						left: `${options.dynamicImportFunction}(`,
						right: ')'
					};
				}
		}
		return null;
	}
}
