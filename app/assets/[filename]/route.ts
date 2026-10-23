import { NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  // Access request.url so Next.js treats this route as request-time dynamic
  // and always reads the latest image files from the root `assets/` folder.
  const _url = request.url;
  void _url;

  const { filename } = await context.params;
  const safeName = path.basename(filename);
  const assetsDir = path.join(process.cwd(), "assets");

  let targetPath = path.join(assetsDir, safeName);
  let exists = false;

  try {
    const stat = await fs.stat(targetPath);
    exists = stat.isFile();
  } catch {
    exists = false;
  }

  // Fallback: if the user placed the same filename with a different image extension (e.g. .jpg/.webp instead of .png)
  if (!exists) {
    try {
      const parsed = path.parse(safeName);
      const files = await fs.readdir(assetsDir);
      const match = files.find(
        (f) => path.parse(f).name.toLowerCase() === parsed.name.toLowerCase()
      );
      if (match) {
        targetPath = path.join(assetsDir, match);
        exists = true;
      }
    } catch {
      exists = false;
    }
  }

  if (!exists) {
    return new Response("Asset not found", { status: 404 });
  }

  try {
    const fileBuffer = await fs.readFile(targetPath);
    const ext = path.extname(targetPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch {
    return new Response("Failed to read asset", { status: 500 });
  }
}

