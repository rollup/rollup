const config = {
	someComponent: { someOtherConfig: false },
	default: { config1: 'config1DefaultValue' }
};

export default (config.someComponent || config.default).config1 || 'config1DefaultValue';
