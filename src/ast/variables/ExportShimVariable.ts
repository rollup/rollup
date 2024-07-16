import type Module from '../../Module';
import { MISSING_EXPORT_SHIM_VARIABLE } from '../../utils/variableNames';
import type { ObjectPath } from '../utils/PathTracker';
import Variable from './Variable';

export default class ExportShimVariable extends Variable {
	readonly module: Module;

	constructor(module: Module) {
		super(MISSING_EXPORT_SHIM_VARIABLE);
		this.module = module;
	}

	includePath(path: ObjectPath): void {
		super.includePath(path);
		this.module.needsExportShim = true;
	}
}
