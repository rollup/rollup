import type { RollupLog } from '../rollup/types';
import type { GetLogFilter } from './getLogFilterType';

export const getLogFilter: GetLogFilter = filters => {
	if (filters.length === 0) return () => true;
	const normalizedFilters = filters.map(filter =>
		filter.split('&').map(subFilter => {
			const inverted = subFilter.startsWith('!');
			if (inverted) subFilter = subFilter.slice(1);
			const [key, ...value] = subFilter.split(':');
			return { inverted, key, parts: value.join(':').split('*') };
		})
	);
	return (log: RollupLog): boolean => {
		nextIntersectedFilter: for (const intersectedFilters of normalizedFilters) {
			for (const { inverted, key, parts } of intersectedFilters) {
				const isFilterSatisfied = testFilter(log, key, parts);
				if (inverted ? isFilterSatisfied : !isFilterSatisfied) {
					continue nextIntersectedFilter;
				}
			}
			return true;
		}
		return false;
	};
};

const testFilter = (log: RollupLog, key: string, parts: string[]): boolean => {
	if (!(key in log)) {
		return false;
	}
	const rawValue = log[key as keyof RollupLog];
	let value = typeof rawValue === 'object' ? JSON.stringify(rawValue) : String(rawValue);
	if (!value.startsWith(parts[0])) {
		return false;
	}
	for (let index = 1; index < parts.length - 1; index++) {
		const part = parts[index];
		const position = value.indexOf(part);
		if (position === -1) {
			return false;
		}
		value = value.slice(position + part.length);
	}
	if (!value.endsWith(parts[parts.length - 1])) {
		return false;
	}
	return true;
};
