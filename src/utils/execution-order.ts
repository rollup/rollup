interface OrderedExecutionUnit {
	execIndex: number;
}

const compareExecIndex = <T extends OrderedExecutionUnit>(unitA: T, unitB: T) =>
	unitA.execIndex > unitB.execIndex ? 1 : -1;

export function sortByExecutionOrder(units: OrderedExecutionUnit[]) {
	units.sort(compareExecIndex);
}
