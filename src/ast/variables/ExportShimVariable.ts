import type Module from '../../Module';
import { MISSING_EXPORT_SHIM_VARIABLE } from '../../utils/variableNames';
import Variable from './Variable';

export default class ExportShimVariable extends Variable {
	module: Module;

	constructor(module: Module) {
		super(MISSING_EXPORT_SHIM_VARIABLE);
		this.module = module;
	}

	include(): void {
		super.include();
		this.module.needsExportShim = true;
	}
}
