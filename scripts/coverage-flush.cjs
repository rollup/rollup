// This script is loaded via `node --require` during coverage runs.
// On Linux, the LLVM profiler runtime's atexit handler does not fire for
// shared libraries loaded via dlopen (as Node loads .node addons), so
// coverage data is never flushed. This script manually calls
// flush_llvm_coverage() (a cfg(coverage)-gated NAPI function) on process exit.

process.on('exit', () => {
	try {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const native = /** @type {{ flushLlvmCoverage?: () => void }} */ (require('../native'));
		native.flushLlvmCoverage?.();
	} catch {
		// Native module not loaded or flush not available — nothing to do.
	}
});
