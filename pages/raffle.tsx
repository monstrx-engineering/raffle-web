/* eslint-disable prefer-const */
import {
	Box,
	Button,
	Card,
	Flex,
	Image,
	Input,
	Pagination,
	SimpleGrid,
	Stack,
	Table,
	Text,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useWallet } from '@suiet/wallet-kit';
import { IconArrowBack, IconCheck, IconX } from '@tabler/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { formatDistanceToNowStrict } from 'date-fns';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { SelectWalletButton } from '~/components/ConnectButton';
import { Countdown } from '~/components/Countdown';
import supabase from '~/lib/supabase';
import {
	WhitelistResponse,
	WhitelistResponseError,
	getWhitelistByRaffleId,
	isRegistered,
	queries,
} from '~/src/services';

let itemsPerPage = 5;
const getPagination = (page) => ({
	from: (page - 1) * itemsPerPage,
	to: page * itemsPerPage,
});

function WhitelistTable({ raffleId }: { raffleId: string }) {
	let [page, setPage] = useState(1);

	let { data: whitelists } = useQuery<unknown, WhitelistResponseError, WhitelistResponse>({
		...queries.whitelists.byRaffleId(raffleId),
		queryFn: () => getWhitelistByRaffleId(raffleId, getPagination(page)),
	});

	let totalItems = whitelists?.count;
	let totalPages = Math.floor(totalItems ?? 0 / itemsPerPage);

	return (
		<>
			<Table maw={{ lg: 960, 560: 480 }} mt={40} mb="md">
				<thead>
					<tr>
						<th>Wallet</th>
						<th>When</th>
					</tr>
				</thead>
				<tbody>
					{whitelists?.data?.map(({ address, created_at }, i) => (
						<tr key={address}>
							<td>{(page - 1) * itemsPerPage + (i + 1)}</td>
							<td>{address}</td>
							<td>{formatDistanceToNowStrict(new Date(created_at))}</td>
						</tr>
					))}
				</tbody>
			</Table>
			<Pagination total={totalPages} onChange={setPage} />
		</>
	);
}

function RaffleDetail({ id }: { id: string }) {
	let wallet = useWallet();

	let { data: raffle } = useQuery({
		...queries.raffles.detail(id),
		select: ({ data }) => data,
	});

	let { data: claimed } = useQuery({
		queryKey: ['isRegistered', { id, address: wallet.address }],
		queryFn: () => isRegistered(id, wallet.address),
		enabled: !!wallet.address,
	});

	let remaining = useMemo(() => raffle?.ticket_max - raffle?.ticket_sold, [raffle]);

	let { mutate: claimWhitelist } = useMutation({
		mutationFn: async (e) => {
			if (!(wallet.connected && wallet.address)) {
				return Promise.reject();
			}

			return supabase.from('participant').insert({ raffle_id: id, address: wallet.address });
		},
		onSuccess: (data) => {
			showNotification({
				title: 'Success',
				message: `Whitelist claimed!`,
				color: 'green',
				icon: <IconCheck />,
			});

			// TODO: refetch whitelist table
			// TODO: refetch remaining tickets
		},
		onError: (error) => {
			showNotification({
				title: 'Error',
				message: JSON.stringify(error),
				color: 'red',
				icon: <IconX />,
			});
		},
	});

	let router = useRouter();

	return (
		<Flex p={60} align="center" direction="column">
			<Box maw={{ lg: 960, 560: 480 }} w="100%" pb="sm">
				<Button variant="subtle" leftIcon={<IconArrowBack size={16} />} onClick={router.back}>
					return
				</Button>
			</Box>

			<SimpleGrid
				maw={{ lg: 960, 560: 480 }}
				cols={2}
				spacing={50}
				breakpoints={[{ maxWidth: 'lg', cols: 1 }]}
			>
				<Image radius="lg" src={raffle?.image} />

				<Card radius="lg" p="lg">
					<Stack py={{ lg: 20, 560: 0 }} justify="space-between">
						<Stack spacing="xs">
							<Input.Label sx={{ alignSelf: 'center' }}>Ends In</Input.Label>
							{raffle?.end_tz && <Countdown date={raffle?.end_tz} />}
						</Stack>

						<Stack spacing="xs" align="center">
							<Input.Label>Tickets Remaining</Input.Label>
							<Text>{`${String(remaining).padStart(3, '0')}/${raffle?.ticket_max}`}</Text>
						</Stack>

						{!wallet.connected ? (
							<SelectWalletButton size="lg" color="cyan">
								Connect Wallet to Claim
							</SelectWalletButton>
						) : (
							<Button
								size="lg"
								color="cyan"
								onClick={claimWhitelist}
								disabled={!wallet.address || claimed}
							>
								{claimed ? 'Claimed!' : 'Claim whitelist'}
							</Button>
						)}
					</Stack>
				</Card>
			</SimpleGrid>

			<WhitelistTable raffleId={id} />
		</Flex>
	);
}

export default function RaffleDetailPage() {
	const router = useRouter();
	const { id } = router.query;

	return typeof id === 'string' && id && <RaffleDetail id={id} />;
}
