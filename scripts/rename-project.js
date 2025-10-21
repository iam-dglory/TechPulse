/**
 * Global Project Rename Script
 *
 * Renames all instances of TechPulse/TechPulze to TexhPulze
 * across the entire project.
 *
 * Usage:
 *   node scripts/rename-project.js
 */

const fs = require('fs');
const path = require('path');

// Replacement mappings
const replacements = [
  { from: /TechPulse/g, to: 'TexhPulze' },
  { from: /TechPulze/g, to: 'TexhPulze' },
  { from: /techpulse/g, to: 'texhpulze' },
  { from: /techpulze/g, to: 'texhpulze' },
  { from: /TECHPULSE/g, to: 'TEXHPULZE' },
  { from: /TECHPULZE/g, to: 'TEXHPULZE' },
];

// File extensions to process
const fileExtensions = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.json',
  '.md',
  '.html',
  '.css',
  '.scss',
  '.env',
  '.env.example',
  '.env.local',
  '.sql',
];

// Directories to exclude
const excludeDirs = [
  'node_modules',
  '.next',
  '.git',
  'dist',
  'build',
  '.vercel',
  '.turbo',
];

let filesChanged = 0;
let replacementsCount = 0;

/**
 * Check if file should be processed
 */
function shouldProcessFile(filePath) {
  const ext = path.extname(filePath);
  const fileName = path.basename(filePath);

  // Check file extension
  if (!fileExtensions.includes(ext) && !fileName.startsWith('.env')) {
    return false;
  }

  // Check if file is in excluded directory
  const pathParts = filePath.split(path.sep);
  for (const excludeDir of excludeDirs) {
    if (pathParts.includes(excludeDir)) {
      return false;
    }
  }

  return true;
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let fileReplacements = 0;

    // Apply all replacements
    for (const { from, to } of replacements) {
      const matches = content.match(from);
      if (matches) {
        content = content.replace(from, to);
        modified = true;
        fileReplacements += matches.length;
      }
    }

    // Write back if modified
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      filesChanged++;
      replacementsCount += fileReplacements;
      console.log(`✅ ${filePath} (${fileReplacements} replacements)`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

/**
 * Recursively process directory
 */
function processDirectory(dirPath) {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // Skip excluded directories
        if (!excludeDirs.includes(entry.name)) {
          processDirectory(fullPath);
        }
      } else if (entry.isFile()) {
        if (shouldProcessFile(fullPath)) {
          processFile(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error processing directory ${dirPath}:`, error.message);
  }
}

/**
 * Main function
 */
function main() {
  console.log('\n🔄 Global Project Rename Script');
  console.log('='.repeat(80));
  console.log('Renaming TechPulse/TechPulze → TexhPulze\n');

  const projectRoot = path.resolve(__dirname, '..');

  console.log(`Project root: ${projectRoot}`);
  console.log(`Processing files with extensions: ${fileExtensions.join(', ')}`);
  console.log(`Excluding directories: ${excludeDirs.join(', ')}\n`);

  // Process the entire project
  processDirectory(projectRoot);

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 Summary');
  console.log('='.repeat(80));
  console.log(`Files changed: ${filesChanged}`);
  console.log(`Total replacements: ${replacementsCount}`);
  console.log('='.repeat(80) + '\n');

  if (filesChanged > 0) {
    console.log('✅ Rename completed successfully!');
    console.log('\n⚠️  Next steps:');
    console.log('1. Review the changes: git diff');
    console.log('2. Test the application thoroughly');
    console.log('3. Update any external references (domain names, etc.)');
    console.log('4. Commit the changes: git add . && git commit -m "chore: Rename project to TexhPulze"');
  } else {
    console.log('ℹ️  No files needed to be changed.');
  }
}

// Run the script
main();
