import('./dep').then(({foo})=>{
  console.log(foo);
  console.log('main');
});
