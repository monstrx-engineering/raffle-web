import { createQueryKeyStore } from '@lukemorales/query-key-factory';
import supabase from '~/lib/supabase';

export const getRaffles = () => supabase.from('raffle').select().throwOnError();

export type RafflesResponse = Awaited<ReturnType<typeof getRaffles>>;
export type RafflesResponseSuccess = RafflesResponse['data'];
export type RafflesResponseError = RafflesResponse['error'];

export const getRaffle = (id: string) => getRaffles().match({ id }).single();

export type RaffleResponse = Awaited<ReturnType<typeof getRaffle>>;
export type RaffleResponseSuccess = RaffleResponse['data'];
export type RaffleResponseError = RaffleResponse['error'];

export const isRegistered = (raffle_id: string, address: string) => {
	return supabase
		.from('participant')
		.select('*', { count: 'exact', head: true })
		.match({ raffle_id, address })
		.throwOnError()
		.maybeSingle()
		.then(({ count }) => Boolean(count));
};

export const getRemainingSlots = (raffle_id: string) => {
	return supabase
		.from('raffle')
		.select('ticket_sold,ticket_max')
		.match({ id: raffle_id })
		.throwOnError()
		.maybeSingle()
		.then(({ data }) => {
			return data?.ticket_max - data?.ticket_sold;
		});
};

export const getWhitelistByRaffleId = (raffle_id: string) => {
	return supabase
		.from('participant')
		.select()
		.match({ raffle_id })
		.order('created_at', { ascending: false })
		.throwOnError();
};

export type WhitelistResponse = Awaited<ReturnType<typeof getWhitelistByRaffleId>>;
export type WhitelistResponseSuccess = WhitelistResponse['data'];
export type WhitelistResponseError = WhitelistResponse['error'];

export const queries = createQueryKeyStore({
	raffles: {
		all: null,
		detail: (id: string) => ({
			queryKey: [id],
			queryFn: () => getRaffle(id),
		}),
	},
	participants: {
		byRaffleId: (raffleId: string) => [raffleId],
	},
	whitelists: {
		byRaffleId: (raffleId: string) => [raffleId],
	},
});
