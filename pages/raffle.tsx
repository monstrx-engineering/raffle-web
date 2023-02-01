/* eslint-disable prefer-const */
import {
	Box,
	Button,
	Card,
	Divider,
	Flex,
	Image,
	Input,
	Pagination,
	SimpleGrid,
	Stack,
	Table,
	Text,
	Title,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useWallet } from '@suiet/wallet-kit';
import { PostgrestError } from '@supabase/supabase-js';
import { IconArrowBack, IconCheck, IconX } from '@tabler/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { formatDistanceToNowStrict, isPast, parseISO } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { MouseEvent, useMemo, useState } from 'react';
import { SelectWalletButton } from '~/components/ConnectButton';
import { Countdown } from '~/components/Countdown';
import supabase from '~/lib/supabase';
import {
	WhitelistResponse,
	WhitelistResponseError,
	getWhitelistByRaffleId,
	queries,
} from '~/src/services';

let itemsPerPage = 8;
const getPagination = (page: number) => ({
	from: (page - 1) * itemsPerPage,
	to: page * itemsPerPage - 1,
});

const TABLE_PLACEHOLDER = Array(5).fill({
	address: '...',
	created_at: '...',
}) as NonNullable<WhitelistResponse['data']>;

function WhitelistTable({ raffleId }: { raffleId: string }) {
	let [page, setPage] = useState(1);

	let { data: whitelists } = useQuery<unknown, WhitelistResponseError, WhitelistResponse>({
		...queries.whitelists.byRaffleId(raffleId, getPagination(page)),
		queryFn: () => getWhitelistByRaffleId(raffleId, getPagination(page)),
		staleTime: 1000,
	});

	let totalItems = whitelists?.count;
	let totalPages = Math.floor((totalItems ?? 0) / itemsPerPage);

	return (
		<>
			<Card mt={40} mb="md">
				<Table>
					<thead>
						<tr>
							<th>No.</th>
							<th>Wallet</th>
							<th style={{ textAlign: 'right' }}>When</th>
						</tr>
					</thead>
					<tbody>
						{(whitelists?.data ?? TABLE_PLACEHOLDER).map(({ address, created_at }, i) => (
							<tr key={i}>
								<td>{(page - 1) * itemsPerPage + (i + 1)}</td>
								<td style={{ fontFamily: 'monospace' }}>
									<Link href={`https://explorer.sui.io/address/${address}`}>{address}</Link>
								</td>
								<td style={{ textAlign: 'right' }}>
									{function () {
										try {
											return formatDistanceToNowStrict(new Date(created_at));
										} catch {
											return '...';
										}
									}.call(null)}
								</td>
							</tr>
						))}
					</tbody>
				</Table>
			</Card>
			<Pagination total={totalPages} onChange={setPage} />
		</>
	);
}

function WinnerTable({ winners }: { winners: string[] }) {
	return (
		<Card>
			<Table>
				<thead>
					<tr>
						<th>No.</th>
						<th style={{ textAlign: 'right' }}>Discord</th>
					</tr>
				</thead>
				<tbody>
					{winners.map((account, i) => (
						<tr key={account}>
							<td>{i + 1}</td>
							<td style={{ textAlign: 'right' }}>{account}</td>
						</tr>
					))}
				</tbody>
			</Table>
		</Card>
	);
}

function RaffleDetail({ id }: { id: string }) {
	let wallet = useWallet();

	let { data: raffle } = useQuery({
		...queries.raffles.detail(id),
	});

	let raffleHasEnded = useMemo(() => {
		let deadline = parseISO(raffle?.end_tz || '') as unknown as number;
		if (Number.isNaN(deadline)) return false;
		return isPast(deadline);
	}, [raffle]);

	let { data: claimed } = useQuery({
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		...queries.raffles.detail(id)._ctx.claimed(wallet.address!),
		enabled: !!wallet.address,
	});

	let remaining = useMemo(() => raffle?.ticket_max - raffle?.ticket_sold, [raffle]);

	let { mutate: claimWhitelist } = useMutation({
		mutationFn: async (_e: MouseEvent<HTMLButtonElement>) => {
			if (!wallet.address) throw Error('no wallet connected');
			return supabase
				.from('participant')
				.insert({ raffle_id: Number(id), address: wallet.address })
				.throwOnError();
		},

		onSuccess: () => {
			showNotification({
				title: 'Success',
				message: `Whitelist claimed!`,
				color: 'green',
				icon: <IconCheck />,
			});
			// TODO: refetch whitelist table
			// TODO: refetch remaining tickets
		},

		onError: (error: PostgrestError) => {
			showNotification({
				title: 'Error',
				message: JSON.stringify(error),
				color: 'red',
				icon: <IconX />,
			});
		},
	});

	const claimButton = !wallet.connected ? (
		<SelectWalletButton size="lg" color="cyan">
			Connect Wallet to Claim
		</SelectWalletButton>
	) : (
		<Button
			size="lg"
			color="cyan"
			onClick={claimWhitelist}
			disabled={!wallet.address || claimed || remaining < 1}
		>
			{(() => {
				switch (true) {
					case raffleHasEnded:
						return 'Raffle ended';
					case claimed:
						return 'Claimed!';
					case remaining < 1:
						return 'Sold out';
					default:
						return 'Claim whitelist';
				}
			}).call()}
		</Button>
	);

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

						{claimButton}

						{raffleHasEnded && (
							<Stack spacing={0}>
								<Divider my="lg" />
								<Title order={4} align="center">
									Winner
								</Title>
								<WinnerTable winners={raffle?.winner?.split(/\s+/) || []} />
							</Stack>
						)}
					</Stack>
				</Card>
			</SimpleGrid>

			{!raffleHasEnded && <WhitelistTable raffleId={id} />}
		</Flex>
	);
}

export default function RaffleDetailPage() {
	const router = useRouter();
	const { id } = router.query;

	return typeof id === 'string' && id && <RaffleDetail id={id} />;
}
