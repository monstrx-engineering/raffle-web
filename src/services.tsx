import { createQueryKeyStore } from '@lukemorales/query-key-factory';
import supabase from '~/lib/supabase';

export const queryKeys = createQueryKeyStore({
	raffles: null,
});

export const getRaffles = () => supabase.from('raffle').select();

export type RafflesResponse = Awaited<ReturnType<typeof getRaffles>>;
// export type RafflesResponseSuccess = RafflesResponse['data'];
// export type RafflesResponseError = RafflesResponse['error'];

export const getRaffle = (id: string) => getRaffles().match({ id }).single();

export type RaffleResponse = Awaited<ReturnType<typeof getRaffle>>;
export type RaffleResponseSuccess = RaffleResponse['data'];
export type RaffleResponseError = RaffleResponse['error'];

export const isRegistered = (raffle_id: string, address: string) =>
	supabase
		.from('whitelist')
		.select('*', { count: 'exact', head: true })
		.match({ raffle_id, address })
		.then(({ count }) => (count ?? 0) > 0);

export const getRemainingSlots = (raffle_id: string) =>
	supabase
		.from('whitelist')
		.select('*', { count: 'exact', head: true })
		.match({ raffle_id })
		.then(({ count }) => count);
