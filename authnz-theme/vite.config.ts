/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { keycloakify } from "keycloakify/vite-plugin";
import { resolve } from "path";
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), keycloakify(), svgr()],
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
		},
	},
	test: {
		coverage: {
			provider: "v8",
			reporter: ["html", "text"],
		},
		environment: "jsdom",
	},
});
