import { Button, Center, Container, Group, SimpleGrid, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { RaffleCard } from '~/src/features/raffle-list/components/RaffleCard';
import { RafflesResponse, RafflesResponseError, getRaffles, queries } from '~/src/services';

export type chain = 'SUI' | 'APTOS';

let Banner = () => (
	<Center
		h={88}
		sx={{
			borderRadius: 8,
			background: `url('/banner.avif') top 26% left 0 / cover`,
		}}
	>
		<Title c="white" size={20}>
			MONSTRX VERSE
		</Title>
	</Center>
);

export default function RaffleListPage() {
	const { data: raffles } = useQuery<unknown, RafflesResponseError, RafflesResponse>({
		...queries.raffles.list,
		queryFn: getRaffles,
	});

	return (
		<Container py={60} size="xl">
			<Banner />

			<Group position="apart" mt={50} mb="sm">
				<Title order={1} size={48} c="white">
					Raffles
				</Title>

				<Button variant="outline" hidden>
					Create Raffle
				</Button>
			</Group>

			<SimpleGrid
				cols={2}
				breakpoints={[
					{ minWidth: 'sm', cols: 3 },
					{ minWidth: 'md', cols: 4 },
					{ minWidth: 'lg', cols: 5 },
				]}
			>
				{raffles?.data?.map((raffle) => {
					let remaining = 0;
					if ([raffle.ticket_max, raffle.ticket_sold].every(Number.isInteger)) {
						remaining = raffle.ticket_max! - raffle.ticket_sold!;
					}

					const href = `/raffle?id=${raffle.id}`;
					return (
						<Link key={href} href={href} passHref>
							<RaffleCard
								style={{ cursor: 'pointer' }}
								name={raffle.name || ''}
								chain={raffle.chain || ''}
								image={raffle.image || ''}
								sales={{
									price: raffle.ticket_price,
									supply: {
										remaining,
										max: raffle.ticket_max,
									},
									endDate: new Date(raffle.end_tz || 0),
								}}
								creator={{
									name: raffle.creator_name,
									avatar: raffle.creator_avatar,
								}}
							/>
						</Link>
					);
				})}
			</SimpleGrid>
		</Container>
	);
}
