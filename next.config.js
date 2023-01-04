const withBundleAnalyzer = require('@next/bundle-analyzer')({
	enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
	reactStrictMode: false,
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	webpack: (config) => {
		config.module.rules.push({
			test: /\.worker\.(js|ts)$/i,
			use: [
				{
					loader: 'comlink-loader',
					options: {
						singleton: true,
					},
				},
			],
		});
		return config;
	},
});
