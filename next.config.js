/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['res.cloudinary.com'],
  },
  env: {
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.dxot3gvqq,
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: process.env.changify,
  }
}

module.exports = nextConfig 