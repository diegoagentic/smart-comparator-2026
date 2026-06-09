const StyleDictionary = require('style-dictionary');

// Custom format for CSS variables with light/dark mode support
StyleDictionary.registerFormat({
  name: 'css/variables-themed',
  formatter: function({ dictionary, options }) {
    const { mode } = options;
    const selector = mode === 'dark' ? '.dark' : ':root';
    
    return `${selector} {\n${dictionary.allTokens
      .map(token => `  --${token.name}: ${token.value};`)
      .join('\n')}\n}\n`;
  }
});

// Custom transform to convert token paths to CSS variable names
StyleDictionary.registerTransform({
  name: 'name/cti/kebab-custom',
  type: 'name',
  transformer: function(token) {
    return token.path.join('-');
  }
});

// Custom transform group
StyleDictionary.registerTransformGroup({
  name: 'custom/css',
  transforms: ['attribute/cti', 'name/cti/kebab-custom', 'time/seconds', 'content/icon', 'size/rem', 'color/css']
});

module.exports = {
  source: [
    'tokens/primitives/**/*.json',
    'tokens/semantic/colors.json',
    'tokens/component/**/*.json'
  ],
  platforms: {
    // CSS Variables (Light Mode)
    css: {
      transformGroup: 'custom/css',
      buildPath: 'src/styles/tokens/',
      files: [{
        destination: 'variables.css',
        format: 'css/variables-themed',
        options: {
          mode: 'light'
        }
      }]
    },
    // CSS Variables (Dark Mode)
    cssDark: {
      transformGroup: 'custom/css',
      buildPath: 'src/styles/tokens/',
      source: [
        'tokens/primitives/**/*.json',
        'tokens/semantic/colors-dark.json',
        'tokens/component/**/*.json'
      ],
      files: [{
        destination: 'variables-dark.css',
        format: 'css/variables-themed',
        options: {
          mode: 'dark'
        }
      }]
    },
    // JavaScript/TypeScript
    js: {
      transformGroup: 'js',
      buildPath: 'src/tokens/',
      files: [{
        destination: 'tokens.js',
        format: 'javascript/es6'
      }, {
        destination: 'tokens.d.ts',
        format: 'typescript/es6-declarations'
      }]
    },
    // JSON (for documentation/tooling)
    json: {
      transformGroup: 'js',
      buildPath: 'src/tokens/',
      files: [{
        destination: 'tokens.json',
        format: 'json/nested'
      }]
    }
  }
};
