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

const dynamicImportMechanisms: Record<string, DynamicImportMechanism> = {
	es: undefined,
	cjs: {
		left: 'Promise.resolve(require(',
		right: '))',
		interopLeft: 'Promise.resolve({ default: require(',
		interopRight: ') })'
	},
	amd: {
		left: 'new Promise(function (resolve, reject) { require([',
		right: '], resolve, reject) })',
		interopLeft: 'new Promise(function (resolve, reject) { require([',
		interopRight: '], function (m) { resolve({ default: m }) }, reject) })'
	},
	system: {
		left: 'module.import(',
		right: ')'
	},
	umd: undefined,
	iife: undefined
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
			code.overwrite(
				this.parent.start,
				this.parent.end,
				`Promise.resolve().then(function () { return ${this.resolutionNamespace}; })`
			);
			return;
		}

		const importMechanism = dynamicImportMechanisms[options.format];
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
