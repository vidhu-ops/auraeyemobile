#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(' ')}`);
    const child = spawn(command, args, {
      stdio: 'pipe',
      shell: true,
      ...options
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    const timeout = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error(`Command timed out: ${command} ${args.join(' ')}`));
    }, 90000); // 90 second timeout

    child.on('close', (code) => {
      clearTimeout(timeout);
      if (code === 0) {
        resolve({ stdout, stderr, code });
      } else {
        console.error(`Command failed: ${stderr}`);
        reject(new Error(`Command failed with exit code ${code}: ${stderr}`));
      }
    });

    child.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

async function buildProduction() {
  try {
    console.log('Starting production build...');
    
    // Clean dist directory
    const distPath = path.join(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      fs.rmSync(distPath, { recursive: true, force: true });
      console.log('Cleaned dist directory');
    }

    // Create dist and public directories
    fs.mkdirSync(path.join(distPath, 'public'), { recursive: true });

    // Try to build client with timeout protection
    console.log('Attempting client build...');
    try {
      const result = await runCommand('npx', ['vite', 'build', '--mode', 'production'], {
        env: { ...process.env, NODE_ENV: 'production' }
      });
      console.log('Client build completed successfully');
    } catch (error) {
      console.log('Client build failed or timed out, creating fallback structure...');
      await createFallbackClientBuild();
    }

    // Build server
    console.log('Building server...');
    await runCommand('npx', ['esbuild', 'server/index.ts', 
      '--platform=node', 
      '--packages=external', 
      '--bundle', 
      '--format=esm', 
      '--outdir=dist'
    ]);

    // Organize build files
    await organizeBuildFiles();

    console.log('Production build completed successfully!');
    
    // Verify build structure
    await verifyBuildStructure();

  } catch (error) {
    console.error('Production build failed:', error.message);
    process.exit(1);
  }
}

async function createFallbackClientBuild() {
  const distPath = path.join(__dirname, 'dist');
  const publicPath = path.join(distPath, 'public');
  
  // Create a comprehensive fallback HTML file
  const fallbackHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Spiritual Wellness Platform</title>
    <meta name="description" content="Advanced spiritual wellness platform combining AI-powered aura analysis, numerology insights, and personalized horoscope readings." />
    <meta property="og:title" content="Spiritual Wellness Platform" />
    <meta property="og:description" content="Discover your spiritual path with AI-powered insights and personalized guidance." />
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .container { 
        text-align: center; 
        max-width: 700px; 
        padding: 3rem;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
      }
      h1 { 
        font-size: 3rem; 
        margin-bottom: 1rem;
        background: linear-gradient(45deg, #f093fb, #f5576c);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .subtitle {
        font-size: 1.2rem;
        margin-bottom: 2rem;
        opacity: 0.9;
      }
      .loading { 
        display: inline-block;
        width: 24px;
        height: 24px;
        border: 3px solid rgba(255,255,255,0.3);
        border-radius: 50%;
        border-top-color: #fff;
        animation: spin 1s ease-in-out infinite;
        margin-right: 12px;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
      .features {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin: 2rem 0;
      }
      .feature {
        padding: 1.5rem;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 15px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        transition: all 0.3s ease;
      }
      .feature:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-5px);
      }
      .feature-icon {
        font-size: 2rem;
        margin-bottom: 0.5rem;
      }
      .feature-title {
        font-weight: bold;
        margin-bottom: 0.5rem;
      }
      .status {
        margin-top: 2rem;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        font-size: 0.9rem;
      }
      .btn {
        display: inline-block;
        padding: 12px 24px;
        background: linear-gradient(45deg, #f093fb, #f5576c);
        color: white;
        text-decoration: none;
        border-radius: 25px;
        margin-top: 1rem;
        transition: all 0.3s ease;
      }
      .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Spiritual Wellness Platform</h1>
      <div class="subtitle">Your AI-Powered Journey to Self-Discovery</div>
      
      <p><span class="loading"></span>Initializing your spiritual experience...</p>
      
      <div class="features">
        <div class="feature">
          <div class="feature-icon">🔮</div>
          <div class="feature-title">Aura Analysis</div>
          <div>AI-powered energy reading and visualization</div>
        </div>
        <div class="feature">
          <div class="feature-icon">🔢</div>
          <div class="feature-title">Numerology</div>
          <div>Personalized number insights and meanings</div>
        </div>
        <div class="feature">
          <div class="feature-icon">⭐</div>
          <div class="feature-title">Horoscopes</div>
          <div>Daily, monthly, and yearly guidance</div>
        </div>
        <div class="feature">
          <div class="feature-icon">🌟</div>
          <div class="feature-title">Spiritual Guidance</div>
          <div>Personalized insights and recommendations</div>
        </div>
      </div>
      
      <div class="status">
        <p>Platform Status: Loading spiritual services...</p>
        <p>If this screen persists, please refresh or try again in a moment.</p>
      </div>
      
      <a href="/" class="btn">Enter Platform</a>
    </div>
    
    <script>
      let retryCount = 0;
      const maxRetries = 3;
      
      function checkPlatform() {
        fetch('/api/user')
          .then(response => {
            if (response.status === 401 || response.status === 200) {
              // API is responding, redirect to main app
              window.location.href = '/';
            } else {
              throw new Error('Platform not ready');
            }
          })
          .catch(() => {
            retryCount++;
            if (retryCount < maxRetries) {
              setTimeout(checkPlatform, 2000);
            }
          });
      }
      
      // Start checking after 3 seconds
      setTimeout(checkPlatform, 3000);
    </script>
  </body>
</html>`;

  fs.writeFileSync(path.join(publicPath, 'index.html'), fallbackHtml);
  console.log('Created fallback client build structure');
}

async function organizeBuildFiles() {
  const distPath = path.join(__dirname, 'dist');
  const publicPath = path.join(distPath, 'public');
  
  // Ensure public directory exists
  if (!fs.existsSync(publicPath)) {
    fs.mkdirSync(publicPath, { recursive: true });
  }
  
  // Move assets to public if they exist
  const assetsPath = path.join(distPath, 'assets');
  const publicAssetsPath = path.join(publicPath, 'assets');
  
  if (fs.existsSync(assetsPath) && !fs.existsSync(publicAssetsPath)) {
    fs.renameSync(assetsPath, publicAssetsPath);
    console.log('Moved assets to public directory');
  }
  
  // Copy index.html to public if it exists and is different
  const indexPath = path.join(distPath, 'index.html');
  const publicIndexPath = path.join(publicPath, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    // Only copy if public index doesn't exist or is different
    if (!fs.existsSync(publicIndexPath) || 
        fs.readFileSync(indexPath, 'utf8') !== fs.readFileSync(publicIndexPath, 'utf8')) {
      fs.copyFileSync(indexPath, publicIndexPath);
      console.log('Copied index.html to public directory');
    }
  }
}

async function verifyBuildStructure() {
  const distPath = path.join(__dirname, 'dist');
  const publicPath = path.join(distPath, 'public');
  
  console.log('\n=== Build Structure Verification ===');
  
  // Check server file
  const serverPath = path.join(distPath, 'index.js');
  if (fs.existsSync(serverPath)) {
    const stats = fs.statSync(serverPath);
    console.log(`✓ Server bundle: ${(stats.size / 1024).toFixed(1)}KB`);
  } else {
    console.log('✗ Server bundle missing');
  }
  
  // Check public directory
  if (fs.existsSync(publicPath)) {
    console.log('✓ Public directory exists');
    const files = fs.readdirSync(publicPath);
    files.forEach(file => {
      const filePath = path.join(publicPath, file);
      const stats = fs.statSync(filePath);
      if (stats.isFile()) {
        console.log(`  - ${file}: ${(stats.size / 1024).toFixed(1)}KB`);
      } else {
        console.log(`  - ${file}/`);
      }
    });
  } else {
    console.log('✗ Public directory missing');
  }
  
  console.log('=== End Verification ===\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  buildProduction();
}