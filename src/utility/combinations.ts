/*
 * combinations([1, 2, 3], [4, 5])
 * => [
 *   [1, 4], [1, 5],
 *   [2, 4], [2, 5],
 *   [3, 4], [3, 5]
 * ]
 */
export function combinations<T, U>(l1: T[], l2: U[]): Array<[T, U]> {
	const result = [];

	for (const first of l1) {
		for (const second of l2) {
			result.push([first, second] as [T, U]);
		}
	}

	return result;
}

