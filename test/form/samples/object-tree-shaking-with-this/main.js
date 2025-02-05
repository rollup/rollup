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

export default config.recipientsList;
