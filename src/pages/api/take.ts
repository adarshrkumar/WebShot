import type { APIRoute } from 'astro';
import { parameters, defaults } from '../../config/screenshot';

function getShotParam(query: URLSearchParams, param: string): string {
    return query.get(param) || defaults[param as keyof typeof defaults]?.toString() || '';
}

export const GET: APIRoute = async ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams;

    console.log('[take] Incoming request:', request.url);
    console.log('[take] Query params:', Object.fromEntries(query.entries()));

    let service = 'thum.io';
    service = query.get('service') !== service ? (query.get('service') || service) : service;
    console.log('[take] Selected service:', service);
    
    const queryString: string[] = [];
    const object: Record<string, string> = {};
    
    parameters.forEach(p => {
        object[p] = getShotParam(query, p);
    });

    console.log('[take] Built parameter object:', object);

    const oUrl = object.url;
    object.url = encodeURIComponent(object.url);
    object.cache_ttl = object.cache ? getShotParam(query, 'cache_ttl') : '';
    object.cache_key = object.cache ? getShotParam(query, 'cache_key') : '';

    object.full_page_scroll = object.full_page ? getShotParam(query, 'full_page_scroll') : '';
    console.log('[take] Original URL:', oUrl);
    
    if (object.wait_until.includes(',')) {
        object.wait_until = object.wait_until.replaceAll(',', '&wait_until=');
    }

    parameters.forEach(p => {
        if (object[p]) queryString.push(`${p}=${object[p]}`);
    });

    const queryStringJoined = queryString.join('&');
    console.log('[take] Query string parts:', queryString);

    let finalQueryString = queryStringJoined ? `?${queryStringJoined}` : '';
    if (service === 'screenshotone') {
        finalQueryString += queryStringJoined ? '&' : '?';
        finalQueryString += 'access_key=' + encodeURIComponent(process.env.SCREENSHOTONE_API_KEY || '');
        console.log('[take] Added ScreenshotOne API key to query string');
    }

    let apiUrl = '';

    switch(service) {
        case 'screenshotone':
            apiUrl = `https://api.screenshotone.com/take${finalQueryString}`;
            break;
        default:
            apiUrl = `https://image.thum.io/get/maxAge/12/width/${object.viewport_width}/${decodeURIComponent(oUrl)}`;
            break;
    }

    console.log('[take] Final API URL:', apiUrl);

    try {
        console.log('[take] Fetching screenshot from service...');
        const response = await fetch(apiUrl);
        console.log('[take] Response status:', response.status, response.statusText);
        console.log('[take] Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            console.error('[take] Screenshot service returned error:', response.status, response.statusText);
            return new Response(`Error: ${response.statusText}`, { status: response.status });
        }

        // Process filename
        let filename = oUrl;
        console.log('[take] Processing filename from URL:', filename);
        if (filename.includes('://')) filename = filename.split('://')[1];
        if (filename.endsWith('/')) filename = filename.slice(0, -1);
        if (filename.startsWith('www.')) filename = filename.slice('www.'.length);
        if (filename.includes('.')) filename = filename.split('.').join('_');
        if (filename.includes('/')) filename = filename.split('/').join('-');
        console.log('[take] Final filename:', filename);

        const format = object.format;
        const contentType = format === 'png' ? 'image/png' : 'image/jpeg';
        console.log('[take] Image format:', format, '| Content-Type:', contentType);

        // Get the image data
        console.log('[take] Reading image buffer...');
        const imageBuffer = await response.arrayBuffer();
        console.log('[take] Image buffer size:', imageBuffer.byteLength, 'bytes');

        console.log('[take] Sending response with filename:', `${filename}.${format}`);
        return new Response(imageBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `inline; filename="${filename}.${format}"`,
                'Cache-Control': 'public, max-age=3600'
            }
        });
    } catch (error) {
        console.error('[take] Error taking screenshot:', error);
        console.error('[take] Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            url: apiUrl,
            service: service
        });
        return new Response(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, {
            status: 500
        });
    }
}; 