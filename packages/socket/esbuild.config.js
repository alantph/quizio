import esbuild from "esbuild"
import path from "path"

export const config = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  minify: true,
  platform: "node",
  outfile: "dist/index.cjs",
  sourcemap: true,
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  alias: {
    "@": path.resolve("./src"),
    "@quizio/socket": path.resolve("./src"),
    "@quizio/common": path.resolve("../common/src"),
  },
  external: [
    "express",
    "cors",
    "mongoose",
    "bcryptjs",
    "jsonwebtoken",
    "@aws-sdk/client-s3",
    "@aws-sdk/s3-request-presigner",
    "multer",
    "socket.io",
    "uuid",
    "zod",
  ],
}

esbuild.build(config)
