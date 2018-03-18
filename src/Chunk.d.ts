declare module 'hash.js/lib/hash/sha/256' {
	export default function sha256(): {
		update: (data: any) => void;
		digest: (format: string) => string;
	};
}
