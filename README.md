<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1lrRbjbFHBYnox2ZwymuJdwaEIptRKrRB

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Docker (production)

Build a small multi-stage image that builds the app with Node and serves the
static `dist` output with nginx.

1. Build the image (from project root):

```bash
docker build -t aerator-runtime-calculator:latest .
```

2. Run the container:

```bash
docker run --rm -p 8080:80 aerator-runtime-calculator:latest
```

Now open http://localhost:8080 to view the production build.

Notes:

- The Dockerfile uses a multi-stage build. The final image only contains nginx
  serving the compiled `dist` directory.
- If you prefer to run the dev server inside a container, consider mounting the
  source and running `npm run dev` in a node image instead (not covered here).

jenkins test
