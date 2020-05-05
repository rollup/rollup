import('./generated-dynamic.js').then(function (n) { return n.b; }).then(({dynamic}) => console.log('main1', dynamic));
