const config = {
	recipients: { ALL: 'all', TEAM: 'team' },

	get recipientsList() {
		return [
			{
				value: this.recipients.ALL
			}
		];
	}
};

var main = config.recipientsList;

export { main as default };
