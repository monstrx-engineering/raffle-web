import { createClient, SupabaseClientOptions } from '@supabase/supabase-js';
import { getCookie } from 'cookies-next';
import type { Database } from './db.types';

const OPTIONS: SupabaseClientOptions<'public'> = {
	global: {
		fetch: (input, init) => {
			let jwt = getCookie('monstrx-token');

			let headers = init?.headers;
			if (jwt) {
				headers['authorization'] = `Bearer ${jwt}`;
			}

			return fetch(input, {
				...init,
				headers,
			});
		},
	},
};

const supabase = createClient<Database, 'public'>(
	process.env.NEXT_PUBLIC_SUPABASE_URL || '',
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
	OPTIONS
);

export default supabase;
