/* eslint-disable prefer-const */
import {
	Box,
	Button,
	Card,
	Divider,
	Flex,
	Image,
	Input,
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
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { SelectWalletButton } from '~/components/ConnectButton';
import { Countdown } from '~/components/Countdown';
import { WhitelistTable } from '~/components/WhitelistTable';
import supabase from '~/lib/supabase';
import { queries, RaffleResponse } from '~/src/services';

function StringTable({ data }: { data: string[] }) {
	return (
		<Table>
			<thead>
				<tr>
					<th>No.</th>
					<th>Discord</th>
				</tr>
			</thead>

			<tbody>
				{data.map((row, i) => {
					return (
						<tr>
							<td>{i + 1}</td>
							<td>{row}</td>
						</tr>
					);
				})}
			</tbody>
		</Table>
	);
}

export type RaffleDetailProps = { data: RaffleResponse };
export type RaffleDetailPageProps = { id: string | string[] | undefined };

function useClaimWhitelist(raffleId: string) {
	return useMutation({
		mutationFn: async (address: string) => {
			if (!address) throw Error('no wallet connected');
			return supabase
				.from('participant')
				.insert({ raffle_id: Number(raffleId), address })
				.throwOnError();
		},

		onSuccess: () => {
			showNotification({
				title: 'Success',
				message: `Whitelist claimed!`,
				color: 'green',
				icon: <IconCheck />,
			});
		},

		onError: (error: PostgrestError) => {
			showNotification({
				title: 'Error',
				message: error.message,
				color: 'red',
				icon: <IconX />,
			});
		},
	});
}

const RaffleDetail = ({ data: raffle }: RaffleDetailProps) => {
	let wallet = useWallet();

	// @ts-ignore
	let raffleDeadline = new Date(raffle?.end_tz).toJSON();
	let raffleHasEnded = !!raffleDeadline && raffleDeadline < new Date().toJSON();

	let remaining = useMemo(() => raffle?.ticket_max - raffle?.ticket_sold, [raffle]);

	let { mutate: claimWhitelist } = useClaimWhitelist(raffle.id);

	const claimButton = !wallet.connected ? (
		<SelectWalletButton size="lg" color="cyan">
			Connect Wallet to Claim
		</SelectWalletButton>
	) : (
		<Button
			size="lg"
			color="cyan"
			onClick={claimWhitelist}
			disabled={!wallet.address || remaining < 1 || raffleHasEnded}
		>
			{(() => {
				switch (true) {
					case raffleHasEnded:
						return 'Raffle ended';
					case remaining < 1:
						return 'Sold out';
					default:
						return 'Claim whitelist';
				}
			}).call()}
		</Button>
	);

	return (
		<Flex p={60} align="center" direction="column">
			<Box maw={{ lg: 960, 560: 480 }} w="100%" pb="sm">
				<Link href="/">
					<Button variant="subtle" leftIcon={<IconArrowBack size={16} />}>
						return
					</Button>
				</Link>
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
						{raffle?.end_tz && (
							<Stack spacing="xs">
								<Input.Label sx={{ alignSelf: 'center' }}>Ends In</Input.Label>
								<Countdown date={raffle?.end_tz} />
							</Stack>
						)}

						<Stack spacing="xs" align="center">
							<Input.Label>Tickets Remaining</Input.Label>
							<Text>{`${String(remaining).padStart(3, '0')}/${raffle?.ticket_max}`}</Text>
						</Stack>

						{claimButton}

						{!!raffle?.winner && raffle.winner !== 'TBA' && (
							<Stack spacing={0}>
								<Divider my="lg" />
								<Title order={4} align="center">
									Winner
								</Title>
								<Card>
									<StringTable data={raffle.winner.split(/\s+/)} />
								</Card>
							</Stack>
						)}
					</Stack>
				</Card>
			</SimpleGrid>

			{raffle && !raffleHasEnded && <WhitelistTable raffleId={raffle.id} />}
		</Flex>
	);
};

const RaffleDetailPage: NextPage<RaffleDetailPageProps> = (props) => {
	let router = useRouter();

	let param = props.id || router.query.id;
	let id = Array.isArray(param) ? param[0] : param;

	let { data, isSuccess } = useQuery({ ...queries.raffles.detail(id!), enabled: !!id });

	return isSuccess ? <RaffleDetail data={data} /> : null;
};

RaffleDetailPage.getInitialProps = ({ query }) => ({ id: query.id });

export default RaffleDetailPage;
