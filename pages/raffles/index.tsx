import { Button, Group, SimpleGrid, Stack, Title } from '@mantine/core';
import Link from 'next/link';
import { useQuery } from 'react-query';
import { RaffleCard } from '~/src/features/raffle-list/components/RaffleCard';
import { getRaffles, queryKeys } from '~/src/services';

export type chain = 'SUI' | 'APTOS';

export default function RaffleListPage() {
	const { data: raffles } = useQuery({
		queryKey: queryKeys.raffles,
		queryFn: getRaffles,
	});

	return (
		<Stack p={60}>
			<Group position="apart">
				<Group>
					<Title order={2}>Raffles</Title>
				</Group>
				<Button variant="outline" hidden>
					Create Raffle
				</Button>
			</Group>
			<SimpleGrid
				cols={2}
				breakpoints={[
					{ minWidth: 'sm', cols: 3 },
					{ minWidth: 'lg', cols: 4 },
				]}
			>
				{raffles?.data?.map((raffle) => (
					<Link
						href={{
							pathname: '/raffle',
							query: { id: raffle.id },
						}}
					>
						<RaffleCard
							name={raffle.name}
							chain={raffle.chain}
							image={raffle.image}
							sales={{
								price: raffle.ticket_price,
								supply: { remaining: 1, max: raffle.ticket_max },
								endDate: Date(raffle.end_tz),
							}}
							creator={{
								name: 'TestnetX',
								avatar: 'https://via.placeholder.com/150',
							}}
						/>
					</Link>
				))}
			</SimpleGrid>
		</Stack>
	);
}
