import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: [{find: "@", replacement: "/src"}]
	},
	server: {
		port: 3000,
	},
	base: "/pentago"
});
