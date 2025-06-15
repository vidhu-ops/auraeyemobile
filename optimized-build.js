#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(' ')}`);
    const process = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    process.on('error', (err) => {
      reject(err);
    });
  });
}

async function optimizedBuild() {
  try {
    console.log('Starting optimized build process...');
    
    // Clean dist directory
    const distPath = path.join(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      fs.rmSync(distPath, { recursive: true, force: true });
      console.log('Cleaned dist directory');
    }

    // Build client with optimizations
    console.log('Building client...');
    await runCommand('npx', ['vite', 'build', '--minify', 'terser'], {
      env: { ...process.env, NODE_ENV: 'production' }
    });

    // Build server
    console.log('Building server...');
    await runCommand('npx', ['esbuild', 'server/index.ts', 
      '--platform=node', 
      '--packages=external', 
      '--bundle', 
      '--format=esm', 
      '--outdir=dist'
    ]);

    // Fix build structure
    console.log('Fixing build structure...');
    await fixBuildStructure();

    console.log('Build completed successfully!');
    
  } catch (error) {
    console.error('Build failed:', error.message);
    process.exit(1);
  }
}

async function fixBuildStructure() {
  const distPath = path.join(__dirname, 'dist');
  const publicPath = path.join(distPath, 'public');
  
  // Create public directory
  if (!fs.existsSync(publicPath)) {
    fs.mkdirSync(publicPath, { recursive: true });
  }
  
  // Move assets to public if they exist
  const assetsPath = path.join(distPath, 'assets');
  const publicAssetsPath = path.join(publicPath, 'assets');
  
  if (fs.existsSync(assetsPath) && !fs.existsSync(publicAssetsPath)) {
    fs.renameSync(assetsPath, publicAssetsPath);
    console.log('Moved assets to dist/public/assets');
  }
  
  // Copy index.html to public if it exists
  const indexPath = path.join(distPath, 'index.html');
  const publicIndexPath = path.join(publicPath, 'index.html');
  
  if (fs.existsSync(indexPath) && !fs.existsSync(publicIndexPath)) {
    fs.copyFileSync(indexPath, publicIndexPath);
    console.log('Copied index.html to dist/public/');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  optimizedBuild();
}