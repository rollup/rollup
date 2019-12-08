declare module 'hash.js/lib/hash/sha/256' {
	export default function sha256(): {
		digest: (format: string) => string;
		update: (data: any) => void;
	};
}
