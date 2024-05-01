import esbuild from 'esbuild';
import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const srcDir = './src';
const distDir = './dist/weirwood/browser';
const manifestPath = './build/manifest.json';

const entryPoints = [
    './src/web-ext/content.ts',
    './src/web-ext/background.ts'
];
const assets = ['./src/assets'];

// Function to ensure directory exists
const ensureDirExists = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

const copyRecursiveSync = (src, dest) => {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
        fs.mkdirSync(dest, { recursive: true });
        fs.readdirSync(src).forEach(childItemName => {
            copyRecursiveSync(path.join(src, childItemName),
                              path.join(dest, childItemName));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
};

const copyManifest = () => {
    const destManifestPath = path.join(distDir, 'manifest.json');
    fs.copyFileSync(manifestPath, destManifestPath);
};

const build = () => {
    ensureDirExists(distDir);
    // Increment the minor version in manifest.json
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    let [major, minor, patch] = manifest.version.split('.').map(Number);
    patch += 1;
    manifest.version = `${major}.${minor}.${patch}`;
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    console.log("MOC esbuild.build()");
    esbuild.build({
        entryPoints: entryPoints,
        outdir: distDir,
        bundle: true,
        minify: true,
        sourcemap: true,
        format: 'esm'
    }).catch(() => process.exit(1));
    console.log("MOC esbuild.build() done");
    assets.forEach(assetDir => {
        fs.readdirSync(assetDir).forEach(file => {
            const srcPath = path.join(assetDir, file);
            const destPath = path.join(distDir, file);
            copyRecursiveSync(srcPath, destPath);
        });
    });

    // Copy HTML and CSS to dist
    // fs.readdirSync(srcDir).forEach(file => {
    //     if (file.endsWith('.html') || file.endsWith('.css')) {
    //         fs.copyFileSync(`${srcDir}/${file}`, `${distDir}/${file}`);
    //     }
    // });

    copyManifest();
};

await runAngularBuild();
// Initial build
build();

// Watch for file changes in src directory
chokidar.watch(srcDir).on('change', (event, path) => {
    console.log(`File ${path} has been changed`);
    runAngularBuild().then(() => {
        build();
    });
});

function runAngularBuild() {
    return new Promise((resolve, reject) => {
      const ngBuild = spawn('ng', ['build']);
  
      ngBuild.stdout.on('data', (data) => {
        console.log(`Angular build stdout: ${data}`);
      });
  
      ngBuild.stderr.on('data', (data) => {
        console.error(`Angular build stderr: ${data}`);
      });
  
      ngBuild.on('close', (code) => {
        if (code === 0) {
          console.log('Angular build completed successfully');
          resolve();
        } else {
          console.error(`Angular build process exited with code ${code}`);
          reject();
        }
      });
    });
  }
