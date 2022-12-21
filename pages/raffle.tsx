import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { getRaffle, RaffleResponse } from '~/src/services';

export default function RaffleDetailPage() {
	const router = useRouter();
	const { id }: { id: string } = router.query;

	let { data: raffle } = useQuery<RaffleResponse>({
		queryKey: ['raffle', id],
		queryFn: () => getRaffle(id),
		enabled: Boolean(id) && typeof id === 'string',
		select: ({ data }) => data,
	});

	return (
		<>
			<pre>{JSON.stringify(raffle, null, 2)}</pre>
		</>
	);
}
