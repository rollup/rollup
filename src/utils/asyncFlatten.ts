export async function asyncFlatten<T>(array: T[]): Promise<T[]> {
	do {
		array = (await Promise.all(array)).flat(Infinity) as any;
	} while (array.some((v: any) => v?.then));
	return array;
}
