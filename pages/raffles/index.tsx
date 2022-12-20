import { Button, Group, SimpleGrid, Stack, Title } from '@mantine/core';
import React from 'react';
import { useQuery } from 'react-query';
import Link from 'next/link';
import { RaffleCard } from '~/src/features/raffle-list/components/RaffleCard';
import { getRaffles } from '~/src/services';
import supabase from '~/lib/supabase';

export type chain = 'SUI' | 'APTOS';

class Price {
	value: string;
	currency: string;

	constructor(value: string, symbol: string) {
		this.value = value;
		this.currency = symbol;
	}

	toString() {
		return `${this.value} ${this.currency}`;
	}
}

export default function RaffleListPage() {
	const { data: raffles } = useQuery({
		queryKey: ['raffles'],
		queryFn: () => supabase.from('raffle').select(),
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
				{raffles?.data.map((raffle) => (
					<Link href={`raffles/${raffle.id}`}>
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
