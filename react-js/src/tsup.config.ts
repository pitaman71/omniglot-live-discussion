import { defineConfig } from 'tsup';
import * as path from 'path';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  external: ['react', 'react-dom', '@pitaman71/omniglot-live-data'],
  // Make absolutely sure we're bundling the models
  noExternal: ['omniglot-live-logistics-models'],
  minify: false,
  splitting: false,
  treeshake: true,
  // Add the following to fix bundling issues
  esbuildOptions(options) {
    // Ensure ESbuild treats omniglot-live-logistics-models as internal
    options.external = options.external?.filter(
      ext => ext !== 'omniglot-live-logistics-models'
    );
  },
  // Add this to see exactly what's being bundled
  metafile: true,
});