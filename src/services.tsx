import { createQueryKeyStore } from '@lukemorales/query-key-factory';
import supabase from '~/lib/supabase';

export const getRaffles = () => supabase.from('raffle').select().throwOnError();

export type RafflesResponse = Awaited<ReturnType<typeof getRaffles>>;
export type RafflesResponseSuccess = RafflesResponse['data'];
export type RafflesResponseError = RafflesResponse['error'];

export const getRaffle = (id: string) => getRaffles().match({ id }).throwOnError().single();

export type RaffleResponse = Awaited<ReturnType<typeof getRaffle>>;
export type RaffleResponseSuccess = RaffleResponse['data'];
export type RaffleResponseError = RaffleResponse['error'];

export const isRegistered = (raffle_id: string, address: string) =>
	supabase
		.from('whitelist')
		.select('*', { count: 'exact', head: true })
		.match({ raffle_id, address })
		.throwOnError()
		.maybeSingle()
		.then(({ count }) => Boolean(count));

export const getRemainingSlots = (raffle_id: string) =>
	supabase
		.from('whitelist')
		.select('*', { count: 'exact', head: true })
		.match({ raffle_id })
		.throwOnError()
		.then(({ count }) => count);

export const queries = createQueryKeyStore({
	raffles: {
		all: null,
		detail: (id: string) => ({
			queryKey: [id],
			queryFn: () => getRaffle(id),
		}),
	},
	whitelists: {
		byRaffleId: (raffleId: string) => [raffleId],
	},
});
