# TechBazaar Deployment Guide

This project deploys cleanly in this order:

1. Create Cloudinary credentials.
2. Deploy MongoDB Atlas and copy the connection string.
3. Deploy the Express backend.
4. Deploy the React frontend.

## 1. Cloudinary

Create a Cloudinary account and collect:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

This project now uploads:

- product images
- review images
- profile images

through the backend before saving them to MongoDB.

## 2. MongoDB Atlas

Create a MongoDB Atlas project and cluster, then:

1. Create a database user.
2. Allow network access.
3. Copy the Node.js connection string.
4. Replace the password placeholder in the URI.

Example:

```env
MONGO_URI=mongodb+srv://your-user:your-password@your-cluster.xxxxx.mongodb.net/TechBazaar?retryWrites=true&w=majority
```

## 3. Backend Deployment

Recommended target: Render web service.

### Root directory

`backend`

### Build command

```bash
npm install
```

### Start command

```bash
npm start
```

### Required environment variables

```env
PORT=5000
MONGO_URI=your-atlas-connection-string
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URLS=https://your-frontend-domain.vercel.app
COOKIE_SAME_SITE=none
COOKIE_SECURE=true
JSON_LIMIT=25mb
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NODE_ENV=production
```

### Important production note

If you later add a custom frontend domain, update `CLIENT_URLS` to match it exactly.

If you need more than one frontend origin, separate them with commas:

```env
CLIENT_URLS=https://your-frontend-domain.vercel.app,https://www.yourdomain.com
```

## 4. Frontend Deployment

Recommended target: Vercel.

### Root directory

`frontend`

### Build command

```bash
npm run build
```

### Output directory

`dist`

### Required environment variable

```env
VITE_API_URL=https://your-backend-service.onrender.com/api
```

## 5. Post-Deploy Checklist

After both services are live:

1. Open the frontend.
2. Register a user.
3. Log in.
4. Open seller dashboard.
5. Create a product with images.
6. Confirm the saved product image URLs are Cloudinary URLs.
7. Update profile image.
8. Place a test order and submit a review with images.

## 6. Common Issues

### Images fail to save

Check:

- Cloudinary env vars are present in the backend
- the backend was redeployed after adding env vars
- the request body is not blocked by missing `JSON_LIMIT`

### Login works locally but not in production

Check:

- `CLIENT_URLS` matches the exact frontend domain
- `COOKIE_SAME_SITE=none`
- `COOKIE_SECURE=true`
- frontend requests use the deployed `VITE_API_URL`

### Atlas connection fails

Check:

- database user and password are correct
- IP/network access allows your hosting provider
- `MONGO_URI` includes the database name

