interface MemoryUsage {
	heapUsed: 0;
}

export default {
	memoryUsage(): MemoryUsage {
		return {
			heapUsed: 0
		};
	}
};
