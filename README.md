# frontend for Sysu Matrix DL

Route:
- react-router

Components:
- matine
- tabler

Style:
- [Tailwind CSS](https://tailwindcss.com/) 

## Getting Started

### Installation

Install the dependencies:

```bash
pnpm install
# npm install
```

### Env

defined in `vite.config.ts`:

```typescript
export default defineConfig({
  // ......
  define: {
    'import.meta.env.BACKEND_AFFIX': JSON.stringify('http://127.0.0.1:8000'),
    'import.meta.env.GRAFANA_URL': JSON.stringify('http://172.18.198.206:3000/public-dashboards/5192664c23254fd3ba56f3ae1701a1a0?orgId=1&refresh=5s')
  },
});
```

### Development

Start the development server with HMR:

```bash
pnpm run dev
# npm run dev
```

然后打开 `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
pnpm run build
npm run build
```

## Deployment

### Docker Deployment

This template includes three Dockerfiles optimized for different package managers:

- `Dockerfile` - for npm
- `Dockerfile.pnpm` - for pnpm
- `Dockerfile.bun` - for bun

To build and run using Docker:

```bash
# For npm
docker build -t my-app .

# For pnpm
docker build -f Dockerfile.pnpm -t my-app .

# For bun
docker build -f Dockerfile.bun -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of (`p`) `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```
