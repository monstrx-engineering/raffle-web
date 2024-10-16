import { createQueryKeyStore } from '@lukemorales/query-key-factory';
import supabase from '~/lib/supabase';

export const getRaffles = () =>
	supabase.from('raffle').select().order('created_at', { ascending: false }).throwOnError();

export type RafflesResponse = Awaited<ReturnType<typeof getRaffles>>;
export type RafflesResponseSuccess = RafflesResponse['data'];
export type RafflesResponseError = RafflesResponse['error'];

export const getRaffle = (id: string) =>
	supabase
		.from('raffle')
		.select()
		.match({ id })
		.throwOnError()
		.maybeSingle()
		.then(({ data }) => {
			const ticket_unsold = data?.ticket_max - data?.ticket_sold;
			return { ...data, ticket_unsold };
		});

export type RaffleResponse = Awaited<ReturnType<typeof getRaffle>>;

export const isRegistered = (raffle_id: string, address: string) => {
	return supabase
		.from('participant')
		.select('*', { count: 'exact', head: true })
		.match({ raffle_id, address })
		.maybeSingle()
		.then(({ count }) => Boolean(count));
};

export type IsRegisteredResponse = Awaited<ReturnType<typeof isRegistered>>;

export type Pagination = {
	from: number;
	to: number;
};

export const getWhitelistByRaffleId = (raffle_id: string, pagination?: Pagination) => {
	let query = supabase
		.from('participant')
		.select('*', { count: 'estimated' })
		.match({ raffle_id })
		.order('created_at', { ascending: false })
		.throwOnError();

	if (pagination) {
		query = query.range(pagination.from, pagination.to);
	}

	return query;
};

export type WhitelistResponse = Awaited<ReturnType<typeof getWhitelistByRaffleId>>;
export type WhitelistResponseSuccess = WhitelistResponse['data'];
export type WhitelistResponseError = WhitelistResponse['error'];

export const queries = createQueryKeyStore({
	raffles: {
		list: null,
		detail: (id: string) => ({
			queryKey: [id],
			queryFn: () => getRaffle(id),
			enabled: Boolean(id),
			contextQueries: {
				claimed: (address: string) => ({
					queryKey: [address],
					queryFn: () => isRegistered(id, address),
					enabled: Boolean(id && address),
				}),
			},
		}),
	},
	participants: {
		byRaffleId: (raffleId: string) => [raffleId],
	},
	whitelists: {
		byRaffleId: (raffleId: string, page) => [raffleId, page],
	},
});
