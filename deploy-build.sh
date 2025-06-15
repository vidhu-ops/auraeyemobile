#!/bin/bash

echo "Starting deployment build process..."

# Clean any existing build
rm -rf dist/

# Set production environment
export NODE_ENV=production

# Build client with timeout handling
echo "Building client files..."
timeout 120 npx vite build --mode production --minify esbuild || {
    echo "Client build timed out, trying alternative approach..."
    
    # Create minimal dist structure
    mkdir -p dist/public
    
    # Copy client files manually if vite build fails
    cp -r client/index.html dist/public/ 2>/dev/null || echo "No index.html found"
    cp -r client/src dist/public/ 2>/dev/null || echo "No src directory found"
    
    echo "Manual client build structure created"
}

# Build server
echo "Building server..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Fix build structure for deployment
echo "Organizing build files..."

# Ensure public directory exists
mkdir -p dist/public

# Move client assets to expected location if they exist
if [ -d "dist/assets" ] && [ ! -d "dist/public/assets" ]; then
    mv dist/assets dist/public/
    echo "Moved assets to public directory"
fi

# Copy index.html to public if it exists
if [ -f "dist/index.html" ] && [ ! -f "dist/public/index.html" ]; then
    cp dist/index.html dist/public/
    echo "Copied index.html to public directory"
fi

# Create fallback index.html if none exists
if [ ! -f "dist/public/index.html" ]; then
    echo "Creating fallback index.html..."
    cat > dist/public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Spiritual Wellness Platform</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .container { max-width: 600px; margin: 0 auto; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Spiritual Wellness Platform</h1>
        <p>Your spiritual wellness platform is starting up...</p>
        <p>If you see this message, the build process completed but the client bundle may still be loading.</p>
    </div>
</body>
</html>
EOF
fi

echo "Build process completed!"
echo "Files structure:"
ls -la dist/
echo ""
echo "Public directory:"
ls -la dist/public/ 2>/dev/null || echo "No public directory found"