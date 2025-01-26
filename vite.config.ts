import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    define: {
      // Pass environment variables to the client
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      'process.env.VITE_ZENO_PAY_ACCOUNT_ID': JSON.stringify(env.VITE_ZENO_PAY_ACCOUNT_ID),
      'process.env.VITE_ZENO_PAY_API_KEY': JSON.stringify(env.VITE_ZENO_PAY_API_KEY),
      'process.env.VITE_ZENO_PAY_SECRET_KEY': JSON.stringify(env.VITE_ZENO_PAY_SECRET_KEY),
    }
  };
});
