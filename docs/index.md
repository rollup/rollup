---
layout: home

hero:
  name: rollup.js
  text: The JavaScript module bundler
  tagline: Compile small pieces of code into something larger and more complex
  image: /rollup-logo.svg
  actions:
    - theme: brand
      text: Get Started
      link: /introduction/
    - theme: alt
      text: View on GitHub
      link: https://github.com/rollup/rollup
features:
  - icon: 🌍
    title: The Web, Node …
    details: 'Rollup supports many output formats: ES modules, CommonJS, UMD, SystemJS and more. Bundle not only for the web but for many other platforms as well.'
    link: /configuration-options/#output-format
    linkText: See all formats
  - icon: 🌳
    title: Tree-shaking
    details: Superior dead code elimination based on deep execution path analysis with the tool that brought tree-shaking to the JavaScript world.
    link: /faqs/#what-is-tree-shaking
    linkText: Learn about tree-shaking
  - icon: 🗡️
    title: Code-splitting without overhead
    details: Split code based on different entry points and dynamic imports by just using the import mechanism of the output format instead of customer loader code.
    link: /tutorial/#code-splitting
    linkText: How to use code-splitting
  - icon: 🔌
    title: Powerful plugins
    details: An easy to learn plugin API that allows you to implement powerful code injections and transformations with little code. Adopted by Vite and WMR.
    link: /plugin-development/#plugins-overview
    linkText: Learn how to write plugins
  - icon: 🛠️
    title: Handles your special needs
    details: Rollup is not opinionated. Many configuration options and a rich plugin interface make it the ideal bundler for special build flows and higher level tooling.
    link: /configuration-options/
    linkText: See all options
  - icon:
      src: /vitejs-logo.svg
    title: The bundler behind Vite
    details: Developing for the web? Vite pre-configures Rollup for you with sensible defaults and powerful plugins while giving you an insanely fast development server.
    link: https://vitejs.dev/
    linkText: Check out Vite
---
