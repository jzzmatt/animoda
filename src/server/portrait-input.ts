const maxDecodedBytes = 8 * 1024 * 1024;
const minEdge = 64;
const maxEdge = 4096;

export type PortraitMediaType = "image/jpeg" | "image/png" | "image/webp";

export type DecodedPortrait = {
  bytes: Buffer;
  mediaType: PortraitMediaType;
  width: number;
  height: number;
};

export type PortraitDecodeResult = { ok: true; portrait: DecodedPortrait } | { ok: false; error: string };

const mediaByMime: Record<string, PortraitMediaType> = {
  "image/jpeg": "image/jpeg",
  "image/jpg": "image/jpeg",
  "image/png": "image/png",
  "image/webp": "image/webp",
};

export function decodePortraitDataUrl(value: string): PortraitDecodeResult {
  const match = /^data:(image\/[a-z0-9.+-]+);base64,([a-z0-9+/=\s]+)$/i.exec(value.trim());
  if (!match) {
    return { ok: false, error: "The photograph must be a base64 JPG, PNG, or WebP data URL." };
  }
  const mediaType = mediaByMime[match[1].toLowerCase()];
  if (!mediaType) {
    return { ok: false, error: "Choose a JPG, PNG, or WebP photograph." };
  }
  let bytes: Buffer;
  try {
    bytes = Buffer.from(match[2].replace(/\s/g, ""), "base64");
  } catch {
    return { ok: false, error: "The photograph could not be read." };
  }
  if (bytes.length === 0) return { ok: false, error: "That photograph is empty." };
  if (bytes.length > maxDecodedBytes) {
    return { ok: false, error: "That photograph is larger than 8MB after decoding. Choose a smaller file." };
  }
  const sniffed = sniffMedia(bytes);
  if (!sniffed) return { ok: false, error: "The photograph bytes do not match JPG, PNG, or WebP." };
  if (sniffed !== mediaType) {
    return { ok: false, error: "The photograph type does not match its file bytes." };
  }
  const size = imageSize(bytes, sniffed);
  if (!size) return { ok: false, error: "The photograph dimensions could not be read." };
  if (size.width < minEdge || size.height < minEdge || size.width > maxEdge || size.height > maxEdge) {
    return { ok: false, error: "The photograph must be between 64 and 4096 pixels on each side." };
  }
  return { ok: true, portrait: { bytes, mediaType: sniffed, width: size.width, height: size.height } };
}

function sniffMedia(bytes: Buffer): PortraitMediaType | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes.toString("ascii", 1, 4) === "PNG") return "image/png";
  if (bytes.length >= 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  return null;
}

function imageSize(bytes: Buffer, mediaType: PortraitMediaType): { width: number; height: number } | null {
  if (mediaType === "image/png") return pngSize(bytes);
  if (mediaType === "image/jpeg") return jpegSize(bytes);
  return webpSize(bytes);
}

function pngSize(bytes: Buffer): { width: number; height: number } | null {
  if (bytes.toString("ascii", 12, 16) !== "IHDR" || bytes.length < 24) return null;
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

function jpegSize(bytes: Buffer): { width: number; height: number } | null {
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) return null;
    const marker = bytes[offset + 1] ?? 0;
    if (marker === 0xd8) {
      offset += 2;
      continue;
    }
    if (marker === 0xd9 || marker === 0xda) return null;
    const length = bytes.readUInt16BE(offset + 2);
    if (length < 2 || offset + 2 + length > bytes.length) return null;
    if (marker >= 0xc0 && marker <= 0xc3) {
      return { height: bytes.readUInt16BE(offset + 5), width: bytes.readUInt16BE(offset + 7) };
    }
    offset += 2 + length;
  }
  return null;
}

function webpSize(bytes: Buffer): { width: number; height: number } | null {
  const chunk = bytes.toString("ascii", 12, 16);
  if (chunk === "VP8X" && bytes.length >= 30) {
    const width = 1 + bytes.readUIntLE(24, 3);
    const height = 1 + bytes.readUIntLE(27, 3);
    return { width, height };
  }
  if (chunk === "VP8 " && bytes.length >= 30) {
    return { width: bytes.readUInt16LE(26) & 0x3fff, height: bytes.readUInt16LE(28) & 0x3fff };
  }
  if (chunk === "VP8L" && bytes.length >= 25) {
    const bits = bytes.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  return null;
}

export function pngStub(width: number, height: number): Buffer {
  const bytes = Buffer.alloc(24);
  bytes.writeUInt32BE(0x89504e47, 0);
  bytes.writeUInt32BE(0x0d0a1a0a, 4);
  bytes.writeUInt32BE(13, 8);
  bytes.write("IHDR", 12);
  bytes.writeUInt32BE(width, 16);
  bytes.writeUInt32BE(height, 20);
  return bytes;
}
