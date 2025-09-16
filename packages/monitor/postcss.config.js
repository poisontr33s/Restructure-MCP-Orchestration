import autoprefixer from 'autoprefixer';
import tailwindcss from '@tailwindcss/postcss';
import postcssPresetEnv from 'postcss-preset-env';

export default {
  plugins: [
    tailwindcss,
    postcssPresetEnv({
      stage: 1, // Enable CSS4 features
      features: {
        // Disable problematic CSS4 features that cause hardcoded issues
        'custom-properties': false, // Handled by CSS variables
        'nesting-rules': true,
        'custom-media-queries': true,
        'media-query-ranges': true,
        'logical-properties-and-values': true,
        'color-functional-notation': true,
        // Prevent hardcoded CSS4 features that break builds
        'css-cascade-layers': false,
        'css-container-queries': false
      },
      browsers: ['last 2 versions', '> 1%', 'not dead'],
      autoprefixer: false // We handle this separately
    }),
    autoprefixer({
      flexbox: 'no-2009', // Fix flexbox hardcoded issues
      grid: 'autoplace'   // Fix grid hardcoded issues
    })
  ],
};
