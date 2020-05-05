import('./main.js').then(function (n) { return n.m; }).then(result => console.log('importer', result));
