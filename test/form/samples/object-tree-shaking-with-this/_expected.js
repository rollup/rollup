const config = {
	recipients: { ALL: 'all'},

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
