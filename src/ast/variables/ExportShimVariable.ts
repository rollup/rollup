import type Module from '../../Module';
import { MISSING_EXPORT_SHIM_VARIABLE } from '../../utils/variableNames';
import type { InclusionContext } from '../ExecutionContext';
import type { ObjectPath } from '../utils/PathTracker';
import Variable from './Variable';

export default class ExportShimVariable extends Variable {
	readonly module: Module;

	constructor(module: Module) {
		super(MISSING_EXPORT_SHIM_VARIABLE);
		this.module = module;
	}

	includePath(path: ObjectPath, context: InclusionContext): void {
		super.includePath(path, context);
		this.module.needsExportShim = true;
	}
}
