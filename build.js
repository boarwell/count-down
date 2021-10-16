import { build } from "esbuild";

await build({
  entryPoints: ["./src/main.tsx"],
  outdir: "./build/",
  bundle: true,
  watch: true,
  minify: true
});
