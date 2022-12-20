import supabase from '~/lib/supabase';

export const getRaffles = () => supabase.from('raffle').select();
