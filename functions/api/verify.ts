import type {
	JsonWebKey,
	PagesFunction,
	SubtleCryptoImportKeyAlgorithm,
} from '@cloudflare/workers-types';
import jwt from '@tsndr/cloudflare-worker-jwt';

type Request = {
	signature: ArrayBuffer | ArrayBufferView;
	message: ArrayBuffer | ArrayBufferView;
	publicKey: (ArrayBuffer | ArrayBufferView) | JsonWebKey;
};

const REQUEST_ENCRYPTION: SubtleCryptoImportKeyAlgorithm = {
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
	discord: (token) =>
		fetch(`https://discord.com/api/oauth2/@me`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}).then((r) => r.json()),
};

export const onRequest: PagesFunction = async (context) => {
	let bytes = await context.request.arrayBuffer();
	let [signature, publicKey, message] = partition(bytes, [64, 32, undefined]);
	let ok = await verify({ signature, publicKey, message });

	if (!ok) return new Response(null, { status: 401 });

	let claims = JSON.parse(new TextDecoder().decode(message));

	let validated = { wallet: claims.wallet };
	if (claims.discord) {
		validated.discord = await Validator.discord(claims.discord)
			.then(({ user }) => `${user.username}#${user.discriminator}`)
			.catch(() => false);
	}

	let token = await jwt.sign(
		{
			iss: 'supabase',
			ref: 'lmxcedbadtekgdeasjfn',
			role: 'anon',
			iat: 1670590664,
			exp: 1986166664,
			...validated,
		},
		context.env.JWT_SECRET
	);

	return new Response(JSON.stringify(validated), {
		status: 200,
		headers: {
			'content-type': 'application/json;charset=UTF-8',
			'set-cookie': `monstrx-token=${token};`,
		},
	});
};
