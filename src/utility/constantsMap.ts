export default function constantsMap<K extends string>(...constants: K[]): Record<K, K> {
	const result = {} as Record<K, K>;
	for (const c of constants) {
		result[c] = c;
	}
	return result;
}

