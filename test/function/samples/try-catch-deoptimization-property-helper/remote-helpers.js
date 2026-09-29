export const remoteHelpers = {
	fails: exec => {
		try {
			exec();
			return false;
		} catch {
			return true;
		}
	}
};
