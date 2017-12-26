import CallExpression from './CallExpression';
import { NodeType } from './NodeType';
import { NodeBase } from './shared/Node';
import MagicString from 'magic-string';
import NamespaceVariable from '../variables/NamespaceVariable';

export interface DynamicImportMechanism {
	left: string,
	right: string
};

export default class Import extends NodeBase {
	type: NodeType.Import;
	parent: CallExpression;

	private resolution: NamespaceVariable | string | void;
	private mechanism: DynamicImportMechanism;

	setResolution (resolution: NamespaceVariable | string | void, mechanism?: DynamicImportMechanism | void): void {
		this.resolution = resolution;
		if (mechanism) {
			this.mechanism = mechanism;
		}
	}

	render (code: MagicString) {
		// if we have the module in the bundle, inline as Promise.resolve(namespace)
		let resolution: string;
		if (this.resolution instanceof NamespaceVariable) {
			// ideally this should be handled like normal tree shaking
			this.resolution.includeVariable();
			resolution = this.resolution.getName();
		} else if (this.resolution) {
			resolution = this.resolution;
		}

		if (this.mechanism) {
			code.overwrite(this.parent.start, this.parent.arguments[0].start, this.mechanism.left);
		}

		if (resolution) {
			code.overwrite(this.parent.arguments[0].start, this.parent.arguments[0].end, resolution);
		}

		if (this.mechanism) {
			code.overwrite(this.parent.arguments[0].end, this.parent.end, this.mechanism.right);
		}
	}
}
