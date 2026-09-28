// Runs the given command with the environment that makes the native module
// and all spawned processes write Rust coverage data, independent of the
// platform shell npm uses to run scripts. On Linux, the LLVM profiler
// runtime's atexit handler does not fire for dlopen'd shared libraries, so
// scripts/coverage-flush.cjs manually calls flushLlvmCoverage() on process exit.
import { spawn } from 'node:child_process';
import path from 'node:path';

process.env.LLVM_PROFILE_FILE = path.join(process.cwd(), 'coverage/profraw/rollup-%p-%12m.profraw');
process.env.NODE_OPTIONS = `--require ${JSON.stringify(
	path.join(process.cwd(), 'scripts/coverage-flush.cjs')
)}`;

const childProcess = spawn(process.argv.slice(2).join(' '), {
	shell: true,
	stdio: 'inherit'
});
childProcess.on('close', exitCode => process.exit(exitCode ?? 1));
