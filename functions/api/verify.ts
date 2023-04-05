import { verifyMessage, IntentScope } from '@mysten/sui.js';
import jwt from '@tsndr/cloudflare-worker-jwt';
import type {
	PagesFunction,
	SubtleCryptoImportKeyAlgorithm as Algorithm,
} from '@cloudflare/workers-types';

const Validator = {
	discord: (token: string) =>
		fetch(`https://discord.com/api/oauth2/@me`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		}).then((r) => r.json()),
};

type Base64 = string;
type Request = {
	signature: Base64;
	message: Base64;
};

export const onRequest: PagesFunction<{ JWT_SECRET: string }> = async (context) => {
	try {
		let { signature, message } = await context.request.json<Request>();
		let ok = await verifyMessage(message, signature, IntentScope.PersonalMessage);

		if (!ok) throw Error();

		let claims = JSON.parse(atob(message)) satisfies Record<string, string>;

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
