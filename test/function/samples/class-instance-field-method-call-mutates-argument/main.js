const config = { enabled: false };

export class Service {
	started = this.start(config);

	start(options) {
		options.enabled = true;
	}
}

export const getStatus = () => (config.enabled ? 'enabled' : 'disabled');
