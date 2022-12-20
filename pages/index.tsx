/* eslint-disable prefer-const */
import {
	Button,
	ButtonProps,
	Card,
	Flex,
	Image,
	Input,
	SimpleGrid,
	Stack,
	Table,
	Text,
} from '@mantine/core';
import { useWallet } from '@suiet/wallet-kit';
import { useQuery } from 'react-query';
import { formatDistanceToNowStrict } from 'date-fns';

import { useCallback, useMemo } from 'react';
import supabase from '~/lib/supabase';

import { SelectWalletButton } from '~/components/ConnectButton';
import { Countdown } from '~/components/Countdown';

let MAX_ITEMS = 500;
let SALES_END_DATE = '2023-01-08T05:12:12.000Z';

function WhitelistTable({ raffleId }: { raffleId: number }) {
	let query = useQuery({
		queryKey: ['whitelists'],
		queryFn: () => supabase.from('whitelist').select().eq('raffle_id', raffleId),
	});

	let whitelists = query.data?.data;

	return (
		<Table maw={{ lg: 960, 560: 480 }} mt={40}>
			<thead>
				<tr>
					<th>Wallet</th>
					<th>When</th>
				</tr>
			</thead>
			<tbody>
				{whitelists?.map(({ id, address, created_at }, i) => (
					<tr key={id}>
						<td>{address}</td>
						<td>{formatDistanceToNowStrict(new Date(created_at))}</td>
					</tr>
				))}
			</tbody>
		</Table>
	);
}

async function isRegistered(address: string) {
	return supabase
		.from('whitelist')
		.select('*', { count: 'exact', head: true })
		.eq('address', address)
		.then(({ count, error }) => {
			if (error) {
				console.error(error);
				throw new Error(error.message);
			}

			return (count ?? 0) > 0;
		});
}

async function getRemainingSlots() {
	return supabase
		.from('whitelist')
		.select('*', { count: 'exact', head: true })
		.then(({ count, error }) => {
			if (error) {
				console.error(error);
				throw new Error(error.message);
			}

			return MAX_ITEMS - (count ?? 0);
		});
}

export default function HomePage() {
	let wallet = useWallet();

	let { data: claimed } = useQuery({
		queryKey: ['isRegistered', wallet.address],
		queryFn: () => isRegistered(wallet.address!),
		enabled: wallet.connected,
	});

	let { data: remaining } = useQuery({
		queryKey: ['remaining'],
		queryFn: () => getRemainingSlots(),
	});

	const claimWhitelist = useCallback(async () => {
		if (wallet.connected && wallet.address) {
			return supabase.from('whitelist').insert({ address: wallet.address });
		}
		return Promise.reject();
	}, [wallet.connected, wallet.address]);

	let buttonProps: ButtonProps = { size: 'lg', color: 'cyan' };
	let button = wallet.connected ? (
		<Button {...buttonProps} onClick={claimWhitelist} disabled={claimed}>
			{claimed ? 'Claimed!' : 'Claim whitelist'}
		</Button>
	) : (
		<SelectWalletButton {...buttonProps}>Connect Wallet to Claim</SelectWalletButton>
	);

	return (
		<Flex p={60} align="center" direction="column">
			<SimpleGrid
				maw={{ lg: 960, 560: 480 }}
				cols={2}
				spacing={50}
				breakpoints={[{ maxWidth: 'lg', cols: 1 }]}
			>
				<Image radius="lg" src={process.env.NEXT_PUBLIC_ARTWORK_URL} />

				<Card radius="lg" p="lg">
					<Stack py={{ lg: 20, 560: 0 }} justify="space-between">
						<Stack spacing="xs">
							<Input.Label sx={{ alignSelf: 'center' }}>Ends In</Input.Label>
							<Countdown date={SALES_END_DATE} />
						</Stack>

						<Stack spacing="xs" align="center">
							<Input.Label>Slots Remaining</Input.Label>
							<Text>{`${String(remaining).padStart(3, '0')}/${MAX_ITEMS}`}</Text>
						</Stack>

						{button}
					</Stack>
				</Card>
			</SimpleGrid>

			<WhitelistTable />
		</Flex>
	);
}
