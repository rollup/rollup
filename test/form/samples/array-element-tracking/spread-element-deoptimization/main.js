const spread = [{ effect() {} }];
[...spread][0].effect = () => console.log('effect');
spread[0].effect();
