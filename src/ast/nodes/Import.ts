import CallExpression from './CallExpression';
import { NodeType } from './NodeType';
import { NodeBase } from './shared/Node';
import MagicString from 'magic-string';
import NamespaceVariable from '../variables/NamespaceVariable';
import { RenderOptions } from '../../Module';

export default class Import extends NodeBase {
	type: NodeType.Import;
	parent: CallExpression;

	private resolution: NamespaceVariable | string | void;
	private resolutionInterop: boolean;

	setResolution (resolution: NamespaceVariable | string | void, interop: boolean): void {
		this.resolution = resolution;
		this.resolutionInterop = interop;
	}

	render (code: MagicString, options: RenderOptions) {
		// if we have the module in the chunk, inline as Promise.resolve(namespace)
		let resolution: string;
		if (this.resolution instanceof NamespaceVariable) {
			// ideally this should be handled like normal tree shaking
			this.resolution.includeVariable();
			code.overwrite(this.parent.start, this.parent.arguments[0].start, 'Promise.resolve().then(function () { return ');
			code.overwrite(this.parent.arguments[0].start, this.parent.arguments[0].end, this.resolution.getName());
			code.overwrite(this.parent.arguments[0].end, this.parent.end, '; })');

		} else if (this.resolution) {
			resolution = this.resolution;

			if (options.importMechanism) {
				const leftMechanism = this.resolutionInterop && options.importMechanism.interopLeft || options.importMechanism.left;
				code.overwrite(this.parent.start, this.parent.arguments[0].start, leftMechanism);
			}

			if (resolution) {
				code.overwrite(this.parent.arguments[0].start, this.parent.arguments[0].end, resolution);
			}

			if (options.importMechanism) {
				const rightMechanism = this.resolutionInterop && options.importMechanism.interopRight || options.importMechanism.right;
				code.overwrite(this.parent.arguments[0].end, this.parent.end, rightMechanism);
			}
		}
	}
}
