import CallExpression from './CallExpression';
import * as NodeType from './NodeType';
import { NodeBase } from './shared/Node';
import MagicString from 'magic-string';
import { RenderOptions } from '../../utils/renderHelpers';

interface DynamicImportMechanism {
	left: string;
	right: string;
	interopLeft?: string;
	interopRight?: string;
}

const getDynamicImportMechanism = (format: string, compact: boolean): DynamicImportMechanism => {
	switch (format) {
		case 'cjs': {
			const _ = compact ? '' : ' ';
			return {
				left: 'Promise.resolve(require(',
				right: '))',
				interopLeft: `Promise.resolve({${_}default:${_}require(`,
				interopRight: `)${_}})`
			};
		}
		case 'amd': {
			const _ = compact ? '' : ' ';
			return {
				left: `new Promise(function${_}(resolve,${_}reject)${_}{${_}require([`,
				right: `],${_}resolve,${_}reject)${_}})`,
				interopLeft: `new Promise(function${_}(resolve,${_}reject)${_}{${_}require([`,
				interopRight: `],${_}function${_}(m)${_}{${_}resolve({${_}default:${_}m${_}})${_}},${_}reject)${_}})`
			};
		}
		case 'system':
			return {
				left: 'module.import(',
				right: ')'
			};
	}
};

export default class Import extends NodeBase {
	type: NodeType.tImport;
	parent: CallExpression;

	private resolutionNamespace: string;
	private resolutionInterop: boolean;
	private rendered: boolean;

	initialise() {
		this.included = false;
		this.resolutionNamespace = undefined;
		this.resolutionInterop = false;
		this.rendered = false;
		this.context.addDynamicImport(this);
	}

	renderFinalResolution(code: MagicString, resolution: string) {
		// avoid unnecessary writes when tree-shaken
		if (this.rendered)
			code.overwrite(this.parent.arguments[0].start, this.parent.arguments[0].end, resolution);
	}

	render(code: MagicString, options: RenderOptions) {
		this.rendered = true;
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

		const importMechanism = getDynamicImportMechanism(options.format, options.compact);
		if (importMechanism) {
			const leftMechanism =
				(this.resolutionInterop && importMechanism.interopLeft) || importMechanism.left;
			code.overwrite(this.parent.start, this.parent.arguments[0].start, leftMechanism);

			const rightMechanism =
				(this.resolutionInterop && importMechanism.interopRight) || importMechanism.right;
			code.overwrite(this.parent.arguments[0].end, this.parent.end, rightMechanism);
		}
	}

	setResolution(interop: boolean, namespace: string = undefined): void {
		this.rendered = false;
		this.resolutionInterop = interop;
		this.resolutionNamespace = namespace;
	}
}
