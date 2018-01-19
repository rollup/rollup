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

	setResolution (resolution: NamespaceVariable | string | void): void {
		this.resolution = resolution;
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
				code.overwrite(this.parent.start, this.parent.arguments[0].start, options.importMechanism.left);
			}

			if (resolution) {
				code.overwrite(this.parent.arguments[0].start, this.parent.arguments[0].end, resolution);
			}

			if (options.importMechanism) {
				code.overwrite(this.parent.arguments[0].end, this.parent.end, options.importMechanism.right);
			}
		}
	}
}
