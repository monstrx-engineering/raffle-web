import { createClient, SupabaseClientOptions } from '@supabase/supabase-js';
import { getCookie } from 'cookies-next';
import type { Database } from './db.types';

let jwt;

const OPTIONS: SupabaseClientOptions<'public'> = {
	global: {
		fetch: (input, init) => {
			jwt = getCookie('__Host-monstrx-token');

			if (typeof jwt === 'string' && jwt) {
				(init?.headers as Headers | undefined)?.set('authorization', `Bearer ${jwt}`);
			}

			return fetch(input, init);
		},
	},
};

const supabase = createClient<Database, 'public'>(
	process.env.NEXT_PUBLIC_SUPABASE_URL || '',
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
	OPTIONS
);

export default supabase;
