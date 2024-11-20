export const getBuilder = () => {
	const variantShapeId = {
		errors: 1n,
		events: 2n,
		calls: 3n
	};

	const buildVariant = variantType => () => {
		try {
			return variantShapeId[variantType];
		} catch {
			return null;
		}
	};

	return {
		buildCall: buildVariant('calls'),
		buildEvent: buildVariant('events'),
		buildError: buildVariant('errors')
	};
};
