class LookupService {
	updateLookupById() {
		return new Promise((resolve) => {
			let result;
			result = 'ok';
			resolve(result);
		});
	}
}

export const promise = new LookupService().updateLookupById();