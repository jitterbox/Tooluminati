import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function mockCheckoutFailPlugin(): Plugin {
  return {
    name: 'mock-checkout-fail',
    configureServer(server) {
      server.middlewares.use('/api/checkout', (_req, res) => {
        res.statusCode = 403;
        res.end('forbidden');
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), mockCheckoutFailPlugin()],
  server: { port: 4183, host: '127.0.0.1' },
});
