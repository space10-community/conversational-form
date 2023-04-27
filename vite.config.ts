import path from 'path'
import visualizer from 'rollup-plugin-visualizer'
import { PluginOption, UserConfigExport } from 'vite'

export default (): UserConfigExport => ({
  plugins: [
    // https://github.com/vitejs/vite/issues/3409
    // Uncomment to generate bundle visualizer
    visualizer({
      template: 'treemap', // or sunburst
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'bundle_analyzer.html'
    }) as PluginOption
  ],
  build: {
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, './index.tsx'),
      name: 'yu-conversational-form',
      fileName: (format) => {
        if (format === 'umd') {
          return 'index.js'
        }

        return `index.${format}.js`
      }
    }
  }
})
