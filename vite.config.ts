import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  server: {
    allowedHosts: ['derivative-game.com', '176.124.145.49'], // add your domain
	
    host: true // allows binding to all IPs (0.0.0.0)
  }
});



