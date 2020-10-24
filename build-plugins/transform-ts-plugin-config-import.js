import { transform } from '@babel/core'

export default function transformTsPluginConfigImport () {
  return {
    name: 'transform-ts-plugin-config-import',
    transform (code, id) {
      if (id.endsWith('import-ts-plugin.ts')) {
        const transformedCode = transform(code, {
          plugins: ['babel-plugin-dynamic-import-node'],
          babelrc: false,
          configFile: false,
          sourceMaps: true
        });
        return { code: transformedCode.code, map: transformedCode.map }
      }
    },
  };
}
