/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["postit1.blob.core.windows.net" , 'lh3.googleusercontent.com'],
  },
  experimental: {
    appDir: true
  }
}

module.exports = nextConfig
