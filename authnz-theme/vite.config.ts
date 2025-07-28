/// <reference types="vitest" />
import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { keycloakify } from "keycloakify/vite-plugin";
import { resolve } from "path";
import svgr from "vite-plugin-svgr";
import tailwindcss from "@tailwindcss/vite";
import eslint from "vite-plugin-eslint2";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		tailwindcss(),
		react(),
		keycloakify({ accountThemeImplementation: "none" }),
		svgr(),
		eslint({
			cache: true,
			fix: false,
			dev: false,
			build: true,
			lintInWorker: false,
			lintDirtyOnly: true,
			emitWarningAsError: true,
		}),
	],
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
} as UserConfig);
