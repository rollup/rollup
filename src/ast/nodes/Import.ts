import MagicString from 'magic-string';
import { findFirstOccurrenceOutsideComment, RenderOptions } from '../../utils/renderHelpers';
import CallExpression from './CallExpression';
import * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

interface DynamicImportMechanism {
	left: string;
	right: string;
}

const accessedImportGlobals = {
	amd: ['require'],
	cjs: ['require'],
	system: ['module']
};

export default class Import extends NodeBase {
	parent!: CallExpression;
	type!: NodeType.tImport;

	private exportMode: 'none' | 'named' | 'default' | 'auto' = 'auto';
	private resolutionNamespace?: string;

	include() {
		if (!this.included) {
			this.included = true;
			this.context.includeDynamicImport(this);
			this.scope.addAccessedGlobalsByFormat(accessedImportGlobals);
		}
	}

	initialise() {
		this.context.addDynamicImport(this);
	}

	render(code: MagicString, options: RenderOptions) {
		if (this.resolutionNamespace) {
			const _ = options.compact ? '' : ' ';
			const s = options.compact ? '' : ';';
			code.overwrite(
				this.parent.start,
				this.parent.end,
				`Promise.resolve().then(function${_}()${_}{${_}return ${this.resolutionNamespace}${s}${_}})`
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

	setResolution(exportMode: 'none' | 'named' | 'default' | 'auto', namespace?: string): void {
		this.exportMode = exportMode;
		this.resolutionNamespace = namespace as string;
	}

	private getDynamicImportMechanism(options: RenderOptions): DynamicImportMechanism | null {
		switch (options.format) {
			case 'cjs': {
				switch (this.exportMode) {
					case 'default':
						const _ = options.compact ? '' : ' ';
						return { left: `Promise.resolve({${_}'default':${_}require(`, right: `)${_}})` };
					default:
						return { left: 'Promise.resolve(require(', right: '))' };
				}
			}
			case 'amd': {
				const _ = options.compact ? '' : ' ';
				const resolve = options.compact ? 'c' : 'resolve';
				const reject = options.compact ? 'e' : 'reject';
				switch (this.exportMode) {
					case 'default':
						return {
							left: `new Promise(function${_}(${resolve},${_}${reject})${_}{${_}require([`,
							right: `],${_}function${_}(m)${_}{${_}${resolve}({${_}'default':${_}m${_}})${_}},${_}${reject})${_}})`
						};
					default:
						return {
							left: `new Promise(function${_}(${resolve},${_}${reject})${_}{${_}require([`,
							right: `],${_}${resolve},${_}${reject})${_}})`
						};
				}
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
