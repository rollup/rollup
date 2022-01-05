import { memoryUsage } from 'process';

export default function getMemory(): number {
	return memoryUsage().heapUsed;
}
