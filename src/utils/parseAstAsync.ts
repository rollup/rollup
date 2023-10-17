import { Worker } from 'node:worker_threads';
import parseWorkerUrl from 'emit:./parseAstWorkerEntry.ts';
import type { AstNode, ParseAst } from '../rollup/types';
import { convertProgram } from './convert-ast';
import getReadStringFunction from './getReadStringFunction';

type MessageResolvers = Map<number, [(buffer: Buffer) => void, (error: unknown) => void]>;

export const getParseAstAsync = () => {
	let workerWithResolvers: { worker: Worker; resolvers: MessageResolvers } | null = null;
	let nextId = 0;

	const parseToBuffer = (code: string, allowReturnOutsideFunction: boolean): Promise<Buffer> => {
		if (!workerWithResolvers) {
			const worker = new Worker(parseWorkerUrl);
			const resolvers: MessageResolvers = new Map();

			worker.on('message', ([id, buffer]: [id: number, buffer: Buffer]) => {
				resolvers.get(id)![0](buffer);
				resolvers.delete(id);
				if (resolvers.size === 0) {
					// We wait one macro task tick to no close the worker if there are
					// additional tasks directly queued up
					setTimeout(async () => {
						if (resolvers.size === 0) {
							workerWithResolvers = null;
							await worker.terminate();
						}
					});
				}
			});

			worker.on('error', error => {
				if (workerWithResolvers?.worker === worker) {
					workerWithResolvers = null;
					for (const [, reject] of resolvers.values()) {
						reject(error);
					}
					resolvers.clear();
				}
			});
			workerWithResolvers = { resolvers, worker };
		}
		const id = nextId++;
		return new Promise<Buffer>((resolve, reject) => {
			workerWithResolvers!.resolvers.set(id, [resolve, reject]);
			workerWithResolvers!.worker.postMessage([id, code, allowReturnOutsideFunction]);
		});
	};

	return async (
		code: Parameters<ParseAst>[0],
		{ allowReturnOutsideFunction = false }: Parameters<ParseAst>[1] = {}
	): Promise<AstNode> => {
		const astBuffer = await parseToBuffer(code, allowReturnOutsideFunction);
		return convertProgram(astBuffer.buffer, getReadStringFunction(astBuffer));
	};
};
