import { writeFile } from 'node:fs/promises';
import { generateNotEditFilesComment, lintTsFile } from './helpers.js';

const notEditFilesComment = generateNotEditFilesComment(import.meta.url);

const astTypesFile = new URL('../src/ast/types.ts', import.meta.url);

await writeFile(astTypesFile, notEditFilesComment);
await lintTsFile(astTypesFile);
