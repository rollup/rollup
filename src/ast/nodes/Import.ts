import MagicString from 'magic-string';
import { findFirstOccurrenceOutsideComment, RenderOptions } from '../../utils/renderHelpers';
import CallExpression from './CallExpression';
import * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';

interface DynamicImportMechanism {
	interopLeft?: string;
	interopRight?: string;
	left: string;
	right: string;
}

const getDynamicImportMechanism = (options: RenderOptions): DynamicImportMechanism => {
	switch (options.format) {
		case 'cjs': {
			const _ = options.compact ? '' : ' ';
			return {
				interopLeft: `Promise.resolve({${_}'default':${_}require(`,
				interopRight: `)${_}})`,
				left: 'Promise.resolve(require(',
				right: '))'
			};
		}
		case 'amd': {
			const _ = options.compact ? '' : ' ';
			const resolve = options.compact ? 'c' : 'resolve';
			const reject = options.compact ? 'e' : 'reject';
			return {
				interopLeft: `new Promise(function${_}(${resolve},${_}${reject})${_}{${_}require([`,
				interopRight: `],${_}function${_}(m)${_}{${_}${resolve}({${_}'default':${_}m${_}})${_}},${_}${reject})${_}})`,
				left: `new Promise(function${_}(${resolve},${_}${reject})${_}{${_}require([`,
				right: `],${_}${resolve},${_}${reject})${_}})`
			};
		}
		case 'system':
			return {
				left: 'module.import(',
				right: ')'
			};
		case 'es':
			return {
				left: `${options.dynamicImportFunction || 'import'}(`,
				right: ')'
			};
	}
	return undefined as any;
};

const accessedImportGlobals = {
	amd: ['require'],
	cjs: ['require'],
	system: ['module']
};

export default class Import extends NodeBase {
	parent!: CallExpression;
	type!: NodeType.tImport;

	private resolutionInterop = false;
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

		const importMechanism = getDynamicImportMechanism(options);
		if (importMechanism) {
			const leftMechanism =
				(this.resolutionInterop && importMechanism.interopLeft) || importMechanism.left;
			const leftMechanismEnd =
				findFirstOccurrenceOutsideComment(code.original, '(', this.parent.callee.end) + 1;
			code.overwrite(this.parent.start, leftMechanismEnd, leftMechanism);

			const rightMechanism =
				(this.resolutionInterop && importMechanism.interopRight) || importMechanism.right;
			code.overwrite(this.parent.end - 1, this.parent.end, rightMechanism);
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

	setResolution(interop: boolean, namespace?: string): void {
		this.resolutionInterop = interop;
		this.resolutionNamespace = namespace as string;
	}
}
