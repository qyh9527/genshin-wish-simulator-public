import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
export default defineConfig({base:'./',plugins:[react(),viteSingleFile({removeViteModuleLoader:true,outputFileName:'genshin抽卡模拟器.html'})],build:{outDir:'../release',emptyOutDir:false},test:{include:['tests/core.test.ts']}});
