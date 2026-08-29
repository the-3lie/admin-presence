/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: '5mb' }
  },
  // `canvas` et `@tensorflow/tfjs-node` sont des modules natifs (binaires
  // compilés) utilisés par la reconnaissance faciale côté serveur
  // (src/lib/faceapiNode.ts). Ils doivent rester externes au bundle
  // webpack et être chargés via require() au runtime Node.
  serverExternalPackages: ['canvas', '@tensorflow/tfjs-node', '@vladmandic/face-api']
};

export default nextConfig;
