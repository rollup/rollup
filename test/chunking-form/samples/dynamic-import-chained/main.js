console.log('main');

// to mess up the internal execution order
if (false) import('./dep2.js')
import('./dep1.js');
