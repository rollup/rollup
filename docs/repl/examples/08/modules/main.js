// JSX SUPPORT
// Try different jsx.mode and see how it is transformed
import './other.js';
const Foo = ({ world }) => <div>Hello {world}!</div>;

console.log(<Foo world="World" />);
