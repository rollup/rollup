export default {
  input: 'main.js',
  logLevel: 'debug',
  plugins: [
    {
      name: 'test',
      buildStart() {
        this.debug('debug-log');
        this.info('info-log');
        this.warn('warn-log');
      }
    }
  ],
  output: {
    format: 'cjs'
  }
}
