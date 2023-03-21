import { DISCORD_CDN_URL } from '~/lib/discord/const';
import { ApiMetadata, User } from '~/lib/discord/types';

export const get = (access_token: string) => {
	return fetch(`https://discord.com/api/oauth2/@me`, {
		headers: {
			Authorization: `Bearer ${access_token}`,
		},
	}).then((r) => {
		if (r.ok) return r.json<ApiMetadata & { user: User }>();
		throw new Error(`${r.status}`);
	});
};

export const getAvatarURL = (id: string, avatar: string, ext = 'png') =>
	`${DISCORD_CDN_URL}/avatars/${id}/${avatar}.${ext}`;
