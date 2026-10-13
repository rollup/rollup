using resource = null;

export async function declaration() {
	await using resource = null;
	for await (const value of [Promise.resolve(1)]) {
		return value;
	}
}

export const expression = async function () {
	await using resource = null;
	for await (const value of [Promise.resolve(1)]) {
		return value;
	}
};

export const arrow = async () => {
	await using resource = null;
	for await (const value of [Promise.resolve(1)]) {
		return value;
	}
};

export const object = {
	async method() {
		await using resource = null;
		for await (const value of [Promise.resolve(1)]) {
			return value;
		}
	}
};

export class Class {
	static async method() {
		await using resource = null;
		for await (const value of [Promise.resolve(1)]) {
			return value;
		}
	}
}
