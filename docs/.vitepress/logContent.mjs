import { readFile } from "node:fs/promises";

const generatedPluginsFileURL = new URL('dist/plugin-development/index.html', import.meta.url);

const code = await readFile(generatedPluginsFileURL, 'utf-8');
console.log('Ids in output:', code.match(/<svg[^>]*?id="[^"]*"/g));
