import {defineConfig} from 'vite'
const config = require("./package.json")
// https://vitejs.dev/config/
export default defineConfig({
    build: {
        lib: { // 库模式构建相关配置
            entry: './index.ts',
            name: "muk-ui",
            fileName:'monito-action'
        },
        rollupOptions: {
            output: {
                // specify the output directory
                dir: 'dist',
                // specify the output file name
                entryFileNames: `${config.name}.js`,
                // specify the format of the output file
                format: 'umd'
            }
        }
    },
})
