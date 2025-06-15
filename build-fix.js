#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function fixBuildStructure() {
  const distPath = path.join(__dirname, 'dist');
  const publicPath = path.join(__dirname, 'dist', 'public');
  
  console.log('Fixing build structure for deployment...');
  
  // Check if dist directory exists
  if (!fs.existsSync(distPath)) {
    console.log('No dist directory found, build may have failed');
    return;
  }
  
  // Create public directory
  if (!fs.existsSync(publicPath)) {
    fs.mkdirSync(publicPath, { recursive: true });
    console.log('Created dist/public directory');
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
  
  console.log('Build structure fixed successfully');
}

fixBuildStructure().catch(console.error);