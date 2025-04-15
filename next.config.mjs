/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Move serverComponentsExternalPackages to top level as serverExternalPackages
  serverExternalPackages: [
    'mongodb',
    '@napi-rs/snappy-linux-x64-gnu',
    '@napi-rs/snappy-linux-x64-musl',
    'kerberos',
    'mongodb-client-encryption',
    'snappy',
    'aws4',
    'saslprep',
    'bson',
    'bson-ext',
    'mongodb-extjson',
    'mongoose'
  ],
  experimental: {
    // Remove serverActions: true as it's now enabled by default
    // Remove serverComponentsExternalPackages from experimental
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Simpler webpack configuration that doesn't rely on plugins
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't attempt to resolve these modules on the client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        util: false,
        'util/types': false,
        aws4: false,
        snappy: false,
        saslprep: false,
        'mongodb-client-encryption': false,
        kerberos: false,
        '@napi-rs/snappy-linux-x64-gnu': false,
        '@napi-rs/snappy-linux-x64-musl': false,
        'bson-ext': false,
        'mongodb-extjson': false,
        'bson': false,
        'mongoose': false,
        mongodb: false,
      }
      
      // Add module aliases for problematic modules
      config.resolve.alias = {
        ...config.resolve.alias,
        mongodb: false,
        mongoose: false,
        bson: false,
      }
    }
    
    return config;
  },
}

export default nextConfig
