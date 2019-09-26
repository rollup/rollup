export const awaitable = async (iterable) => {
	for await (const value of iterable) {
	}
}

// This is equivalent to the above 'awaitable' function.
export const equivalent = async (iterable) => {
	const iterator = iterable[Symbol.asyncIterator]()
  let { done } = await iterator.next()
  while (!done) {
    ({ done } = await iterator.next())
  }

}

export const iterate = iterable => {
	for (const value of iterable) {
	}
}
