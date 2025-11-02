import * as esbuild from 'esbuild';
import path from 'path';

const commonConfig = {
  bundle: true,
  platform: 'node' as const,
  target: 'node18' as const,
  format: 'cjs' as const,
  sourcemap: true,
  minify: process.env.NODE_ENV === 'production',
  external: ['electron', 'better-sqlite3', 'pdf-to-printer', 'puppeteer']
};

async function build() {
  try {
    // Build main process
    await esbuild.build({
      ...commonConfig,
      entryPoints: [path.resolve(__dirname, 'main.ts')],
      outfile: path.resolve(__dirname, '../main.js'),
    });

    // Build preload script
    await esbuild.build({
      ...commonConfig,
      entryPoints: [path.resolve(__dirname, 'preload.ts')],
      outfile: path.resolve(__dirname, '../preload.js'),
    });

    console.log('Build completed successfully');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build(); 