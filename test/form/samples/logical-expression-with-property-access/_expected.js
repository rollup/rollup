const config = {
	someComponent: { },
	default: { config1: 'config1DefaultValue' }
};

var main = (config.someComponent || config.default).config1 || 'config1DefaultValue';

export { main as default };
