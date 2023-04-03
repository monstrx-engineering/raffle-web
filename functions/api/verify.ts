import jwt from '@tsndr/cloudflare-worker-jwt';
import type {
	PagesFunction,
	SubtleCryptoImportKeyAlgorithm as Algorithm,
} from '@cloudflare/workers-types/2022-11-30';

type Request = {
	signature: Parameters<typeof crypto.subtle.verify>[2];
	message: Parameters<typeof crypto.subtle.verify>[3];
	publicKey: Parameters<typeof crypto.subtle.importKey>[1];
};

const REQUEST_ENCRYPTION: Algorithm = {
	name: 'NODE-ED25519',
	namedCurve: 'NODE-ED25519',
};

async function verify({ signature, message, publicKey }: Request) {
	let key = await crypto.subtle.importKey('raw', publicKey, REQUEST_ENCRYPTION, false, ['verify']);
	return crypto.subtle.verify(REQUEST_ENCRYPTION, key, signature, message);
}

const partition = (bytes: ArrayBuffer, indexes: number[]) => {
	let cursor = 0;

	return indexes.map((index) => {
		let chunk = new DataView(bytes, cursor, index);
		cursor += index;
		return chunk;
	});
};

const Validator = {
	discord: (token: string) =>
		fetch(`https://discord.com/api/oauth2/@me`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}).then((r) => r.json()),
};

export const onRequest: PagesFunction<{ JWT_SECRET: string }> = async (context) => {
	try {
		let bytes = await context.request.arrayBuffer();
		let [signature, publicKey, message] = partition(bytes, [64, 32, undefined]);
		let ok = await verify({ signature, publicKey, message });

		if (!ok) throw Error();

		let claims = JSON.parse(new TextDecoder().decode(message)) as Record<string, string>;

		let validated: Record<string, string> = { wallet: claims.wallet };
		if (claims.discord) {
			let { user } = await Validator.discord(claims.discord);
			validated.discord = `${user.username}#${user.discriminator}`;
		}

		let tomorrow = Date.now() + 24 * 60 * 60 * 1000;
		let token = await jwt.sign(
			{
				iss: 'supabase',
				ref: 'lmxcedbadtekgdeasjfn',
				role: 'anon',
				exp: Math.floor(tomorrow / 1000),
				// iat:  Math.floor(Date.now() / 1000), // implicitly inserted
				...validated,
			},
			context.env.JWT_SECRET
		);

		let tmr = new Date(tomorrow).toUTCString();

		let headers = {
			'content-type': 'application/json;charset=UTF-8',
			'set-cookie': `__Host-monstrx-token=${token}; Secure; Path=/; Expires=${tmr};`,
		};

		return new Response(JSON.stringify(validated), { status: 200, headers });
	} catch (e) {
		// eslint-disable-next-line no-console
		console.error(e);
		return new Response(null, { status: 401 });
	}
};
