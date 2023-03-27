import {defineConfig} from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        lib: { // 库模式构建相关配置
            entry: './index.ts',
            name: "muk-ui",
        }
    },
})
