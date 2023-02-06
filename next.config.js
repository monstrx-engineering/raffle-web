const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
	enabled: process.env.ANALYZE === 'true',
});

// prettier-ignore
const PROXY_API_REQS_TO_CLOUDFLARE = {
	source: 		 '/api/:rest*',
	destination: '/api/:rest*',
};

/** @returns {import('next').NextConfig} */
const config = (phase) => ({
	reactStrictMode: false,
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	swcMinify: true,
	async rewrites() {
		return [phase === PHASE_DEVELOPMENT_SERVER && PROXY_API_REQS_TO_CLOUDFLARE];
	},
});

module.exports = (...params) => withBundleAnalyzer(config(...params));
