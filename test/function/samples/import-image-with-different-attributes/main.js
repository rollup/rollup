import smallLogoImage from './logo.png' with { size: '100' };
import largeLogoImage from './logo.png' with { size: '200' };

assert.equal(smallLogoImage, './logo.png?size=100');
assert.equal(largeLogoImage, './logo.png?size=200');