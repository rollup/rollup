import { ChunkExports, ChunkDependencies } from "../../Chunk";

export default function getExportBlock (
	exports: ChunkExports,
	dependencies: ChunkDependencies,
	exportMode: string,
	mechanism = 'return'
) {
	if (exportMode === 'default') {
		let local;
		exports.some(expt => {
			if (expt.exported === 'default') {
				local = expt.local;
				return true;
			}
			return false;
		});
		// search for reexported default otherwise
		if (!local) {
			dependencies.some(dep => {
				if (!dep.reexports)
					return false;
				return dep.reexports.some(expt => {
					if (expt.reexported === 'default') {
						local = `${dep.name}.${expt.imported}`;
						return true;
					}
					return false;
				});
			})
		}
		return `${mechanism} ${local};`;
	}

	let exportBlock = '';

	dependencies.forEach(({ name, reexports }) => {
		if (reexports && exportMode !== 'default') {
			reexports.forEach(specifier => {
				if (specifier.imported === '*') {
					exportBlock += `${exportBlock ? '\n' : ''}Object.keys(${name}).forEach(function (key) { exports[key] = ${name}[key]; });`;
				}
			});
		}
	});

	dependencies.forEach(({ name, reexports }) => {
		if (reexports && exportMode !== 'default') {
			reexports.forEach(specifier => {
				if (specifier.imported !== '*') {
					exportBlock += `${exportBlock ? '\n' : ''}exports.${specifier.reexported} = ${name}.${specifier.imported};`;
				}
			});
		}
	});

	exports.forEach(expt => {
		const lhs = `exports.${expt.exported}`;
		const rhs = expt.local;
		if (lhs === rhs) {
			return;
		}
		if (exportBlock) {
			exportBlock += '\n';
		}
		exportBlock += `${lhs} = ${rhs};`;
	});

	return exportBlock;
}
