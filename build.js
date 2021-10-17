import { build } from "esbuild";

// ex. node ./build.js watch
const watch = process.argv[2] === "watch";

await build({
  entryPoints: ["./src/main.tsx"],
  outdir: "./build/",
  bundle: true,
  minify: true,
  watch,
});
