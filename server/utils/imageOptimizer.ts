import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export async function optimizeImage(
  inputPath: string,
  outputPath: string,
  options: {
    width?: number;
    height?: number;
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
    progressive?: boolean;
  } = {}
): Promise<void> {
  const {
    width,
    height,
    maxWidth = 1200,
    maxHeight,
    quality = 85,
    format = 'webp',
    progressive = true
  } = options;

  const resizeWidth = width || maxWidth;
  const resizeHeight = height || maxHeight;

  const transformer = sharp(inputPath)
    .resize(resizeWidth, resizeHeight, {
      fit: 'inside',
      withoutEnlargement: true
    });

  if (format === 'webp') {
    await transformer
      .webp({ 
        quality,
        effort: 6, // Higher effort for better compression
        nearLossless: false,
        smartSubsample: true
      })
      .toFile(outputPath);
  } else if (format === 'jpeg') {
    await transformer
      .jpeg({ 
        quality,
        progressive,
        mozjpeg: true // Better compression
      })
      .toFile(outputPath);
  } else if (format === 'png') {
    await transformer
      .png({ 
        quality,
        compressionLevel: 9,
        progressive
      })
      .toFile(outputPath);
  }
}

export async function createMultipleFormats(
  inputPath: string,
  outputDir: string,
  filename: string,
  options: {
    sizes?: number[];
    quality?: number;
  } = {}
): Promise<{ webp: string; original: string; sizes: { [key: string]: string } }> {
  const { sizes = [400, 800, 1200], quality = 85 } = options;
  const ext = path.extname(filename);
  const name = path.basename(filename, ext);

  const formats = {
    webp: '',
    original: '',
    sizes: {} as { [key: string]: string }
  };

  // Create WebP version
  const webpPath = path.join(outputDir, `${name}.webp`);
  await optimizeImage(inputPath, webpPath, { format: 'webp', quality });
  formats.webp = webpPath;

  // Create optimized original format
  const originalFormat = ext.slice(1) as 'jpeg' | 'png';
  const originalPath = path.join(outputDir, `${name}-optimized${ext}`);
  await optimizeImage(inputPath, originalPath, { 
    format: originalFormat === 'jpg' ? 'jpeg' : originalFormat, 
    quality 
  });
  formats.original = originalPath;

  // Create different sizes
  for (const size of sizes) {
    const sizeWebpPath = path.join(outputDir, `${name}-${size}w.webp`);
    const sizeOriginalPath = path.join(outputDir, `${name}-${size}w${ext}`);

    await optimizeImage(inputPath, sizeWebpPath, { 
      format: 'webp', 
      width: size, 
      quality 
    });

    await optimizeImage(inputPath, sizeOriginalPath, { 
      format: originalFormat === 'jpg' ? 'jpeg' : originalFormat,
      width: size, 
      quality 
    });

    formats.sizes[`${size}w`] = {
      webp: sizeWebpPath,
      original: sizeOriginalPath
    };
  }

  return formats;
}

export function getOptimizedPath(originalPath: string): string {
  const dir = path.dirname(originalPath);
  const ext = path.extname(originalPath);
  const name = path.basename(originalPath, ext);
  return path.join(dir, `${name}-optimized.webp`);
}

export async function cleanupOriginal(originalPath: string): Promise<void> {
  try {
    await fs.unlink(originalPath);
  } catch (error) {
    console.warn(`Falha ao remover arquivo original: ${originalPath}`, error);
  }
}