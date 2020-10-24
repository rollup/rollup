export default async () => {
	try {
		return (await import('@rollup/plugin-typescript')).default();
	} catch {
		throw new Error(
			'Please install @rollup/plugin-typescript or use another config file extension.'
		);
	}
};
