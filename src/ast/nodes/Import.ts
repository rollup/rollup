import CallExpression from './CallExpression';
import { NodeType } from './NodeType';
import { NodeBase } from './shared/Node';
import MagicString from 'magic-string';
import { RenderOptions } from '../../utils/renderHelpers';

export default class Import extends NodeBase {
	type: NodeType.Import;
	parent: CallExpression;

	private resolutionNamespace: string;
	private resolutionInterop: boolean;
	private rendered: boolean;

	initialise() {
		this.included = false;
		this.resolutionNamespace = undefined;
		this.resolutionInterop = false;
		this.rendered = false;
		this.module.addDynamicImport(this);
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
		} else if (options.importMechanism) {
			const leftMechanism =
				(this.resolutionInterop && options.importMechanism.interopLeft) ||
				options.importMechanism.left;
			code.overwrite(this.parent.start, this.parent.arguments[0].start, leftMechanism);

			const rightMechanism =
				(this.resolutionInterop && options.importMechanism.interopRight) ||
				options.importMechanism.right;
			code.overwrite(this.parent.arguments[0].end, this.parent.end, rightMechanism);
		}
	}

	setResolution(interop: boolean, namespace: string = undefined): void {
		this.rendered = false;
		this.resolutionInterop = interop;
		this.resolutionNamespace = namespace;
	}
}
