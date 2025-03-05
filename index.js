var service = 'thum.io'

const fs = require('fs')
const stream = require('stream')
const util = require('util')
const fetch = require('node-fetch')

const streamPipeline = util.promisify(stream.pipeline);

var parameters = [
    'url', 
    'access_key', 
    'viewport_width', 'viewport_height', 
    'device_scale_factor', 
    'image_quality', 
    'omit_background', 
    'format', 
    'full_page', 
    'block_ads', 
    'block_cookie_banners', 
    'block_trackers', 
    'block_banners_by_heuristics', 
    'cache', 'cache_ttl', 'cache_key', 
    'delay', 
    'timeout', 
    'wait_until', 
    'user_agent', 
    'authorization', 
    'headers', 
    'cookies', 
    'time_zone', 
]

var defaults = {
    url: 'https://adarshrkumar.dev', 
    access_key: 'Fqdz8P4VTnNBWg', 
    viewport_width: 1920, 
    viewport_height: 1080, 
    device_scale_factor: 1, 
    image_quality: 80, 
    omit_background: false, 
    format: 'jpg', 
    block_ads: true, 
    block_cookie_banners: true, 
    full_page: false, 
    block_trackers: true, 
    block_banners_by_heuristics: true, 
    cache: false, 
    cache_ttl: 0, 
    cache_key: '', 
    delay: 0, 
    timeout: 60, 
    wait_until: 'load,domcontentloaded', 
    user_agent: '', 
    authorization: '', 
    headers: '', 
    cookies: '', 
    time_zone: '',     
}

const express = require('express');
const app = express();

app.get('/', function(req, res) {
    res.send(`<h2>Availible Parameters</h2>
<pre>
    <code>${JSON.stringify(parameters, null, 2)}</code>
</pre>
<h2>Default Parameters</h2>
<pre>
    <code>${JSON.stringify(defaults, null, 2)}</code>
</pre>`);
});

function getShotParam(query, param) {
    return query[param] || defaults[param]
}

app.get('/take', async function(req, res) {
    var queryString = []

    var object = {}
    parameters.forEach(p => {
        object[p] = getShotParam(req.query, p)
    })
    var oUrl = object.url
    object.url = encodeURIComponent(object.url)
    object.cache_ttl = object.cache ? getShotParam(req.query, 'cache_ttl') : ''
    object.cache_key = object.cache ? getShotParam(req.query, 'cache_key') : ''
    
    object.full_page_scroll = object.full_page ? getShotParam(req.query, 'full_page_scroll') : ''
    
    if (object.wait_until.includes(',')) {
        object.wait_until = object.wait_until.replaceAll(',', '&wait_until=')
    }

    parameters.forEach(p => {
        if (object[p]) queryString.push(`${p}=${object[p]}`)
    })
    queryString = queryString.join('&')
    if (queryString) queryString = `?${queryString}`

    var url = ''

    switch(service) {
        case 'screenshotone': 
            url = `https://api.screenshotone.com/take${queryString}`
            break
        default: 
            url = `https://image.thum.io/get/maxAge/12/width/${object.viewport_width}/${decodeURIComponent(oUrl)}`
            break
    }

    var response = await fetch(url);
    if (!response.ok) {
        res.send(`Error: ${response.statusText}`)
        return
    }

    if (oUrl.includes('://')) oUrl = oUrl.split('://')[1]
    if (oUrl.endsWith('/')) oUrl = oUrl.slice(0, -1)
    if (oUrl.startsWith('www.')) oUrl = oUrl.slice('www.'.length)
    if (oUrl.includes('.')) oUrl = oUrl.split('.').join('_')
    if (oUrl.includes('/')) oUrl = oUrl.split('/').join('-')

    if (!fs.existsSync(`./files`)) fs.mkdirSync(`./files`)

    var format = object.format
    await streamPipeline(response.body, fs.createWriteStream(`./files/${oUrl}.${format}`));

    res.sendFile(`${__dirname}/files/${oUrl}.${format}`)
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});