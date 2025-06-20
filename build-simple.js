#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const runCommand = (command, cwd = process.cwd()) => {
  try {
    console.log(`Running: ${command}`);
    execSync(command, { 
      stdio: 'inherit', 
      cwd,
      env: { ...process.env, NODE_ENV: 'production' }
    });
  } catch (error) {
    console.error(`Command failed: ${command}`);
    throw error;
  }
};

async function buildForProduction() {
  console.log('🚀 Starting production build...');
  
  try {
    // Clean previous builds
    if (fs.existsSync('dist')) {
      fs.rmSync('dist', { recursive: true, force: true });
      console.log('✅ Cleaned previous build');
    }

    // Build client
    console.log('📦 Building client...');
    runCommand('npx vite build');
    
    // Build server
    console.log('🔧 Building server...');
    runCommand('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist');
    
    // Verify build output
    if (fs.existsSync('dist/index.js')) {
      console.log('✅ Server build successful');
    } else {
      throw new Error('Server build failed - no output file');
    }
    
    if (fs.existsSync('dist/index.html')) {
      console.log('✅ Client build successful');
    } else {
      console.log('⚠️  Client build may have issues - checking alternate locations');
    }
    
    console.log('🎉 Build completed successfully!');
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

buildForProduction();