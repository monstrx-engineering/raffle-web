import { createClient, SupabaseClientOptions } from '@supabase/supabase-js';
import { getCookie } from 'cookies-next';
import type { Database } from './db.types';

const customFetch: typeof fetch = (input, options) => {
	let headers: Record<string, string> = {};

	let jwt = getCookie('monstrx-token');
	if (jwt) {
		headers['Authorization'] = `Bearer ${jwt}`;
	}

	return fetch(input, {
		...options,
		headers: {
			...options?.headers,
			...headers,
		},
	});
};

const OPTIONS: SupabaseClientOptions<'public'> = {
	global: {
		fetch: customFetch,
	},
};

const supabase = createClient<Database, 'public'>(
	process.env.NEXT_PUBLIC_SUPABASE_URL || '',
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
	OPTIONS
);

export default supabase;
