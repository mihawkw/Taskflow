import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 设置 base 为 './' 使得所有资源路径变为相对路径
  // 这样无论部署在 /taskflow 还是其他子路径下都能正常加载
  base: './', 
});