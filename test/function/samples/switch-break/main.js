function issue(obj) {
	switch (obj.field1) {
		case 'baz':
			switch (obj.field2) {
				case 'value': {
					if (obj.field1) {
						if (obj.field1) {
							break;
						}
					}
					throw new Error(`error 1`);
				}
				default:
					throw new Error(`error 2`);
			}
			break; // retained
		default:
			throw new Error('error 3');
	}
}
issue({ field1: 'baz', field2: 'value' });
