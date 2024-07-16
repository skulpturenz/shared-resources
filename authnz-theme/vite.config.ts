import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { keycloakify } from "keycloakify/vite-plugin";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), keycloakify()],
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
		},
	},
});
