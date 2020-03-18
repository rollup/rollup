console.log('no importer', new URL('generated-lib.js', import.meta.url).href);
console.log('from maim', new URL('generated-lib.js', import.meta.url).href);
console.log('from nested', new URL('generated-lib2.js', import.meta.url).href);
