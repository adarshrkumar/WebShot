import type { APIRoute } from 'astro';
import { parameters, defaults } from '../../config/screenshot';

function getShotParam(query: URLSearchParams, param: string): string {
    return query.get(param) || defaults[param as keyof typeof defaults]?.toString() || '';
}

export const GET: APIRoute = async ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams;
    
    let service = 'thum.io';
    service = query.get('service') !== service ? (query.get('service') || service) : service;
    
    const queryString: string[] = [];
    const object: Record<string, string> = {};
    
    parameters.forEach(p => {
        object[p] = getShotParam(query, p);
    });
    
    const oUrl = object.url;
    object.url = encodeURIComponent(object.url);
    object.cache_ttl = object.cache ? getShotParam(query, 'cache_ttl') : '';
    object.cache_key = object.cache ? getShotParam(query, 'cache_key') : '';
    
    object.full_page_scroll = object.full_page ? getShotParam(query, 'full_page_scroll') : '';
    
    if (object.wait_until.includes(',')) {
        object.wait_until = object.wait_until.replaceAll(',', '&wait_until=');
    }

    parameters.forEach(p => {
        if (object[p]) queryString.push(`${p}=${object[p]}`);
    });
    
    const queryStringJoined = queryString.join('&');
    let finalQueryString = queryStringJoined ? `?${queryStringJoined}` : '';
    if (service === 'screenshotone') {
        finalQueryString += queryStringJoined ? '&' : '?';
        finalQueryString += 'access_key=' + encodeURIComponent(process.env.SCREENSHOTONE_API_KEY || '');
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

    try {
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            return new Response(`Error: ${response.statusText}`, { status: response.status });
        }

        // Process filename
        let filename = oUrl;
        if (filename.includes('://')) filename = filename.split('://')[1];
        if (filename.endsWith('/')) filename = filename.slice(0, -1);
        if (filename.startsWith('www.')) filename = filename.slice('www.'.length);
        if (filename.includes('.')) filename = filename.split('.').join('_');
        if (filename.includes('/')) filename = filename.split('/').join('-');

        const format = object.format;
        const contentType = format === 'png' ? 'image/png' : 'image/jpeg';
        
        // Get the image data
        const imageBuffer = await response.arrayBuffer();
        
        return new Response(imageBuffer, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Content-Disposition': `inline; filename="${filename}.${format}"`,
                'Cache-Control': 'public, max-age=3600'
            }
        });
    } catch (error) {
        console.error('Error taking screenshot:', error);
        return new Response(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { 
            status: 500 
        });
    }
}; 