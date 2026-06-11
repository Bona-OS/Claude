// Gera dist/os-cinco-de-lata.html: um único arquivo com Three.js, fonte
// pixel e todo o jogo embutidos. Uso: node scripts/build-dist.mjs
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);

execSync(
  'npx -y esbuild src/main.js --bundle --format=iife --minify ' +
  '--alias:three=./vendor/three/three.module.min.js ' +
  '"--alias:three/addons/environments/RoomEnvironment.js=./vendor/three/addons/environments/RoomEnvironment.js" ' +
  '--outfile=/tmp/ocdl-bundle.js',
  { stdio: 'inherit' }
);

let html = readFileSync('index.html', 'utf8');
let css = readFileSync('style.css', 'utf8');
const js = readFileSync('/tmp/ocdl-bundle.js', 'utf8');

// fonte pixel embutida (12KB → base64) para funcionar com file://
const font = readFileSync('vendor/fonts/press-start-2p-latin-400-normal.woff2').toString('base64');
css = css.replace(
  "url('vendor/fonts/press-start-2p-latin-400-normal.woff2')",
  `url('data:font/woff2;base64,${font}')`
);

html = html.replace(/<link rel="stylesheet"[^>]*>/, () => `<style>\n${css}\n</style>`);
html = html.replace(/<script type="importmap">[\s\S]*?<\/script>/, () => '');
html = html.replace(/<script type="module" src="src\/main.js"><\/script>/, () => `<script>\n${js}\n</script>`);

mkdirSync('dist', { recursive: true });
writeFileSync('dist/os-cinco-de-lata.html', html);
console.log(`dist/os-cinco-de-lata.html: ${(html.length / 1024).toFixed(0)}KB`);
