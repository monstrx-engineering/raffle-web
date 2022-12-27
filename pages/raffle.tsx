/* eslint-disable prefer-const */
import {
	Box,
	Button,
	Card,
	Flex,
	Image,
	Input,
	SimpleGrid,
	Stack,
	Table,
	Text,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { useWallet } from '@suiet/wallet-kit';
import { IconArrowBack, IconCheck, IconX } from '@tabler/icons';
import { formatDistanceToNowStrict } from 'date-fns';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SelectWalletButton } from '~/components/ConnectButton';
import { Countdown } from '~/components/Countdown';
import supabase from '~/lib/supabase';
import { getRaffle, getRemainingSlots, isRegistered, queries } from '~/src/services';

const getWhitelistByRaffleId = (raffleId: string) => {
	return supabase
		.from('whitelist')
		.select()
		.eq('raffle_id', raffleId)
		.order('created_at', { ascending: false })
		.then((response) => {
			if (response.error) {
				throw Object.assign(new Error(), response.error);
			} else {
				return response.data;
			}
		});
};

function WhitelistTable({ raffleId }: { raffleId: string }) {
	let { data: whitelists } = useQuery({
		queryKey: queries.whitelists.byRaffleId(raffleId),
		queryFn: () => getWhitelistByRaffleId(raffleId),
	});

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

function RaffleDetail({ id }: { id: string }) {
	let wallet = useWallet();
	let queryClient = useQueryClient();

	let { data: raffle } = useQuery({
		...queries.raffles.detail(id),
		select: ({ data }) => data,
	});

	let { data: claimed } = useQuery({
		queryKey: ['isRegistered', { id, address: wallet.address! }],
		queryFn: () => isRegistered(id, wallet.address!),
		enabled: wallet.connected,
	});

	let { data: remaining } = useQuery({
		queryKey: ['remaining', { id }],
		queryFn: () => getRemainingSlots(id),
		enabled: !!raffle,
		select: (count) => raffle.ticket_max - count,
	});

	let { mutate: claimWhitelist } = useMutation({
		mutationFn: async () => {
			if (!(wallet.connected && wallet.address)) {
				return Promise.reject();
			}

			let response = await supabase
				.from('whitelist')
				.insert({ raffle_id: id, address: wallet.address });

			if (!response.error) {
				showNotification({
					title: 'Success',
					message: `Whitelist claimed!`,
					color: 'green',
					icon: <IconCheck />,
				});
				return response;
			}

			let message = response.error.details;
			showNotification({
				title: 'Error',
				message,
				color: 'red',
				icon: <IconX />,
			});
			throw Object.assign(new Error(), response.error);
		},
		onSuccess: () => {
			queryClient.refetchQueries({ queryKey: queries.whitelists.byRaffleId(id).queryKey });
			queryClient.refetchQueries({ queryKey: ['isRegistered', { id, address: wallet.address! }] });
			queryClient.refetchQueries({ queryKey: ['remaining', { id }] });
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
							<Input.Label>Slots Remaining</Input.Label>
							<Text>{`${String(remaining).padStart(3, '0')}/${raffle?.ticket_max}`}</Text>
						</Stack>

						{!wallet.connected ? (
							<SelectWalletButton size="lg" color="cyan">
								Connect Wallet to Claim
							</SelectWalletButton>
						) : (
							<Button size="lg" color="cyan" onClick={claimWhitelist} disabled={claimed}>
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
