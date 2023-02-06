/* eslint-disable max-classes-per-file */
import * as Popup from '~/src/utils/popup';
import { useEffect } from 'react';

export const DISCORD_CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!;
const CALLBACK_FN = '@@/discord/auth/callback';

declare global {
	interface Window {
		[CALLBACK_FN](_: string): void;
	}
}

export type ImplicitGrantDone = {
	token_type: string;
	access_token: string;
	expires_in: string;
	scope: string;
	state?: string;
};

export type ImplicitGrantFail = {
	error: string;
	error_description: string;
};

export type ImplicitGrantResult = ImplicitGrantDone | ImplicitGrantFail;

function getImplicitGrantURL(state?: string) {
	let url = new URL('https://discord.com/oauth2/authorize');

	url.search = new URLSearchParams({
		response_type: 'token',
		client_id: DISCORD_CLIENT_ID,
		scope: 'identify',
		redirect_uri: `${window.location.origin}/auth/discord/callback`,
		state: state || crypto.randomUUID(),
	}).toString();

	return url;
}

export class InterruptedError extends Error {
	constructor() {
		super('Auth flow interrupted by user');
	}
}

export class StateMismatchError extends Error {
	constructor() {
		super('State mismatch');
	}
}

export function fetchImplicitAccessToken(state?: string) {
	let popup = Popup.center(getImplicitGrantURL(state), { width: 480, height: 640 });

	return new Promise<ImplicitGrantDone>((resolve, reject) => {
		/**
		 * store callback as global window var
		 * @param qs {string} `window.location.hash` of the popup, without the #
		 */
		window[CALLBACK_FN] = (qs: string) => {
			let result = Object.fromEntries(new URLSearchParams(qs)) as ImplicitGrantResult;

			if ('error' in result) {
				reject(Object.assign(new Error(result.error_description), { name: result.error }));
			} else if (state && state !== result.state) {
				reject(new StateMismatchError());
			} else {
				resolve(result);
			}
		};

		// periodically check if popup is closed before user has accepted/rejected
		let timer = setInterval(() => {
			if (!popup || popup.closed) {
				clearInterval(timer);
				reject(new InterruptedError());
			}
		}, 1000);
	});
}

export function CallbackPage() {
	useEffect(() => {
		window.opener[CALLBACK_FN]?.(window.location.hash.slice(1));
		window.close();
	}, []);

	return 'Loading...';
}

CallbackPage.getLayout = (page) => page;
