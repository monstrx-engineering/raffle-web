import { DISCORD_CDN_URL } from '~/lib/discord/const';
import { ApiMetadata, User } from '~/lib/discord/types';

export const get = (access_token: string): Promise<ApiMetadata & { user: User }> => {
	return fetch(`https://discord.com/api/oauth2/@me`, {
		headers: {
			Authorization: `Bearer ${access_token}`,
		},
	}).then((r) => r.json());
};

export const getAvatarURL = (id: string, avatar: string, ext = 'png') =>
	`${DISCORD_CDN_URL}/avatars/${id}/${avatar}.${ext}`;
