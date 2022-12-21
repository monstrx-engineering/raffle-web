import supabase from '~/lib/supabase';

export const getRaffles = () => supabase.from('raffle').select();

export type RafflesResponse = Awaited<ReturnType<typeof getRaffles>>;
export type RafflesResponseSuccess = RafflesResponse['data'];
export type RafflesResponseError = RafflesResponse['error'];

export const getRaffle = (id: string) => getRaffles().match({ id }).single();

export type RaffleResponse = Awaited<ReturnType<typeof getRaffle>>;
export type RaffleResponseSuccess = RaffleResponse['data'];
export type RaffleResponseError = RaffleResponse['error'];
