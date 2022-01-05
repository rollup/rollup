import { performance } from 'perf_hooks';

export default function now(): number {
	return performance.now();
}
