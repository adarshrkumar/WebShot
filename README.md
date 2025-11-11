# WebShot - Screenshot Service

A modern web screenshot service built with Astro, providing an API to capture screenshots of websites.

## Features

- 🚀 Built with Astro for optimal performance
- 📸 Screenshot websites with customizable parameters
- 🌐 Support for multiple screenshot services (thum.io, screenshotone)
- 🎨 Modern, responsive UI
- ☁️ Ready for deployment on Vercel

## API Usage

### Endpoint
```
GET /api/take
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `url` | string | `https://adarshrkumar.dev` | The URL to screenshot |
| `viewport_width` | number | `1920` | Viewport width |
| `viewport_height` | number | `1080` | Viewport height |
| `format` | string | `jpg` | Image format (jpg, png) |
| `service` | string | `thum.io` | Screenshot service to use |
| `access_key` | string | `Fqdz8P4VTnNBWg` | API access key |
| `device_scale_factor` | number | `1` | Device scale factor |
| `image_quality` | number | `80` | Image quality (1-100) |
| `omit_background` | boolean | `false` | Omit background |
| `full_page` | boolean | `false` | Capture full page |
| `block_ads` | boolean | `true` | Block advertisements |
| `block_cookie_banners` | boolean | `true` | Block cookie banners |
| `block_trackers` | boolean | `true` | Block trackers |
| `block_banners_by_heuristics` | boolean | `true` | Block banners by heuristics |
| `cache` | boolean | `false` | Enable caching |
| `cache_ttl` | number | `0` | Cache TTL |
| `cache_key` | string | `''` | Cache key |
| `delay` | number | `0` | Delay before capture |
| `timeout` | number | `60` | Request timeout |
| `wait_until` | string | `load,domcontentloaded` | Wait until condition |
| `user_agent` | string | `''` | Custom user agent |
| `authorization` | string | `''` | Authorization header |
| `headers` | string | `''` | Custom headers |
| `cookies` | string | `''` | Custom cookies |
| `time_zone` | string | `''` | Time zone |

### Example Usage

```bash
# Basic screenshot
curl "http://localhost:4321/api/take?url=https://google.com"

# Custom dimensions and format
curl "http://localhost:4321/api/take?url=https://github.com&viewport_width=1366&viewport_height=768&format=png"

# Full page screenshot
curl "http://localhost:4321/api/take?url=https://example.com&full_page=true"
```

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:4321`

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Deployment

This project is configured for deployment on Vercel with the `@astrojs/vercel` adapter.

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

The API routes will be available as serverless functions on Vercel.

## Project Structure

```
src/
├── pages/
│   ├── index.astro          # Main documentation page
│   └── api/
│       └── take.ts          # Screenshot API endpoint
├── components/              # Astro components (if any)
└── layouts/                 # Layout components (if any)
```

## Technologies Used

- [Astro](https://astro.build/) - Web framework
- [@astrojs/vercel](https://docs.astro.build/en/guides/integrations-guide/vercel/) - Vercel adapter
- [thum.io](https://thum.io/) - Screenshot service
- [ScreenshotOne](https://screenshotone.com/) - Alternative screenshot service

## License

ISC
