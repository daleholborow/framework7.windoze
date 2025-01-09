const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const getOutput = require('./get-output.js');

async function buildClean(project, cb) {
  if (process.env.NODE_ENV === 'development' && project !== 'core') {
    cb();
    return;
  }

  const output = `${getOutput()}/${project}`;

  try {
    // Files to preserve
    const preserveFiles = ['postinstall.js'];

    // Patterns to remove
    const patterns = [
      '**/*.js',
      '*.js',
      '**/*.ts',
      '*.ts',
      '**/*.svelte',
      '*.svelte',
      '**/*.css',
      '*.css',
      '**/*.less',
      '*.less',
      '**/*.map',
      '*.map',
      'cjs',
      'esm',
      'components',
      'less',
      'modules',
      'types/*.ts',
      'types/components',
      'types/modules',
      'types/shared'
    ];

    // Process each pattern
    for (const pattern of patterns) {
      if (pattern.endsWith('.js')) {
        // Handle JavaScript files (excluding postinstall.js)
        const files = glob.sync(path.join(output, pattern));
        for (const file of files) {
          const basename = path.basename(file);
          if (!preserveFiles.includes(basename)) {
            await fs.remove(file);
          }
        }
      } else {
        // Handle other patterns
        const matches = glob.sync(path.join(output, pattern));
        for (const match of matches) {
          await fs.remove(match);
        }
      }
    }

    if (cb) cb();
  } catch (err) {
    console.error('Clean error:', err);
    if (cb) cb(err);
  }
}

module.exports = buildClean;