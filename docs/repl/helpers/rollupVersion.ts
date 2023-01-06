// TODO Lukas limit to support only Rollup >= 1 and display error for lower versions
const _isRollupVersionAtLeast = (version: string, major: number, minor: number) => {
	if (!version) return true;
	const [currentMajor, currentMinor] = version.split('.').map(Number);
	return currentMajor > major || (currentMajor === major && currentMinor >= minor);
};
