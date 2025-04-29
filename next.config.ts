import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "xcxgmbehvjotfnhjajwe.supabase.co",
				pathname: "/storage/v1/object/public/images/**",
			},
			{
				protocol: "https",
				hostname: "cloud.appwrite.io",
				pathname: "/v1/storage/buckets/**",
			},
		],
	},
};

export default nextConfig;
