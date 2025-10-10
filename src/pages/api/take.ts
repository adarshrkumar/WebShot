import type { APIRoute } from 'astro';
import sharp from 'sharp';

export const GET: APIRoute = async ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams;
    
    const imageUrl = query.get('url');
    const width = parseInt(query.get('width') || '0');
    const height = parseInt(query.get('height') || '0');
    const format = query.get('format') || 'jpeg';
    
    if (!imageUrl) {
        return new Response('Error: url parameter is required', { status: 400 });
    }
    
    if (!width && !height) {
        return new Response('Error: width or height parameter is required', { status: 400 });
    }

    try {
        // Fetch the original image
        const response = await fetch(imageUrl);
        
        if (!response.ok) {
            return new Response(`Error fetching image: ${response.statusText}`, { status: response.status });
        }

        const imageBuffer = await response.arrayBuffer();
        
        // Process with Sharp
        let sharpInstance = sharp(Buffer.from(imageBuffer));
        
        // Get original metadata
        const metadata = await sharpInstance.metadata();
        
        // Calculate dimensions
        let targetWidth = width;
        let targetHeight = height;
        
        // If only width is provided, calculate height maintaining aspect ratio
        if (width && !height) {
            targetHeight = Math.round((width * metadata.height!) / metadata.width!);
        }
        // If only height is provided, calculate width maintaining aspect ratio
        else if (!width && height) {
            targetWidth = Math.round((height * metadata.width!) / metadata.height!);
        }
        
        // Resize the image
        sharpInstance = sharpInstance.resize(targetWidth, targetHeight, {
            fit: 'inside',
            withoutEnlargement: false
        });
        
        // Convert format if needed
        switch (format.toLowerCase()) {
            case 'png':
                sharpInstance = sharpInstance.png();
                break;
            case 'webp':
                sharpInstance = sharpInstance.webp();
                break;
            case 'jpeg':
            case 'jpg':
            default:
                sharpInstance = sharpInstance.jpeg({ quality: 90 });
                break;
        }
        
        const resizedBuffer = await sharpInstance.toBuffer();
        
        // Generate filename
        let filename = imageUrl;
        if (filename.includes('://')) filename = filename.split('://')[1];
        if (filename.endsWith('/')) filename = filename.slice(0, -1);
        if (filename.startsWith('www.')) filename = filename.slice('www.'.length);
        if (filename.includes('.')) filename = filename.split('.').join('_');
        if (filename.includes('/')) filename = filename.split('/').join('-');
        
        const contentType = format === 'png' ? 'image/png' : 
                           format === 'webp' ? 'image/webp' : 'image/jpeg';
        
        return new Response(resizedBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `inline; filename="${filename}_${targetWidth}x${targetHeight}.${format}"`,
                'Cache-Control': 'public, max-age=3600'
            }
        });
    } catch (error) {
        console.error('Error resizing image:', error);
        return new Response(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { 
            status: 500 
        });
    }
}; 