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
  const { filename } = await context.params;
  const safeName = decodeURIComponent(path.basename(filename));

  const searchDirs = [
    path.join(process.cwd(), "public", "assets"),
    path.join(process.cwd(), "assets"),
  ];

  let targetPath = "";
  let exists = false;

  for (const dir of searchDirs) {
    try {
      const p = path.join(dir, safeName);
      const stat = await fs.stat(p);
      if (stat.isFile()) {
        targetPath = p;
        exists = true;
        break;
      }
    } catch {
      // Continue to next directory or fallback search
    }
  }

  // Fallback: Case-insensitive search or alternative extension match
  if (!exists) {
    const parsed = path.parse(safeName);
    for (const dir of searchDirs) {
      try {
        const files = await fs.readdir(dir);
        const match = files.find(
          (f) =>
            f.toLowerCase() === safeName.toLowerCase() ||
            path.parse(f).name.toLowerCase() === parsed.name.toLowerCase()
        );
        if (match) {
          targetPath = path.join(dir, match);
          exists = true;
          break;
        }
      } catch {
        // Continue
      }
    }
  }

  if (!exists || !targetPath) {
    return new Response("Asset not found", { status: 404 });
  }

  try {
    const stat = await fs.stat(targetPath);
    const fileSize = stat.size;
    const ext = path.extname(targetPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    // Handle HTTP Range header for smooth video seeking & streaming
    const rangeHeader = request.headers.get("range");
    if (rangeHeader && ext === ".mp4") {
      const parts = rangeHeader.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const fileHandle = await fs.open(targetPath, "r");
      const buffer = Buffer.alloc(chunkSize);
      await fileHandle.read(buffer, 0, chunkSize, start);
      await fileHandle.close();

      return new Response(buffer, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize.toString(),
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    const fileBuffer = await fs.readFile(targetPath);
    return new Response(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": fileSize.toString(),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Failed to read asset", { status: 500 });
  }
}
