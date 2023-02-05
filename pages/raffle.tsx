/* eslint-disable prefer-const */
import {
	ActionIcon,
	Box,
	Button,
	Card,
	createStyles,
	Divider,
	Flex,
	Group,
	Image,
	Input,
	Menu,
	Pagination,
	SimpleGrid,
	Stack,
	Table,
	Text,
	Title,
} from '@mantine/core';
import { showNotification, updateNotification } from '@mantine/notifications';
import { useWallet } from '@suiet/wallet-kit';
import { PostgrestError } from '@supabase/supabase-js';
import {
	IconArrowBack,
	IconBrandDiscord,
	IconCheck,
	IconChevronDown,
	IconLogout,
	IconSwitchHorizontal,
	IconX,
} from '@tabler/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import { formatDistanceToNowStrict, isPast, parseISO } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { MouseEvent, useMemo, useState } from 'react';
import { SelectWalletButton } from '~/components/ConnectButton';
import { Countdown } from '~/components/Countdown';
import { fetchImplicitAccessToken, ImplicitGrantDone } from '~/lib/discord/implicitGrant';
import supabase from '~/lib/supabase';
import {
	getWhitelistByRaffleId,
	queries,
	WhitelistResponse,
	WhitelistResponseError,
} from '~/src/services';
import { useLocalStorage } from '@mantine/hooks';
import * as DiscordProfile from '~/lib/discord/profile';

const useStyles = createStyles((theme) => ({
	button: {
		borderTopRightRadius: 0,
		borderBottomRightRadius: 0,
	},

	menuControl: {
		borderTopLeftRadius: 0,
		borderBottomLeftRadius: 0,
		border: 0,
		borderLeft: `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white}`,
	},
}));

function SplitButton({ button: Button, children: dropdown }) {
	const { classes, theme } = useStyles();
	// const menuIconColor = theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 5 : 6];

	return (
		<Group noWrap spacing={0}>
			{React.cloneElement(Button, { className: classes.button })}
			<Menu transition="pop" position="bottom-end">
				<Menu.Target>
					<ActionIcon
						variant="filled"
						color={Button.props.color || theme.primaryColor}
						size={36}
						className={classes.menuControl}
						h={50}
					>
						<IconChevronDown size={16} stroke={1.5} />
					</ActionIcon>
				</Menu.Target>
				{dropdown}
			</Menu>
		</Group>
	);
}

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

function ConnectDiscordButton() {
	let [credentials, setCredentials, clearCredentials] = useLocalStorage<ImplicitGrantDone | null>({
		key: 'discord-credentials',
		defaultValue: null,
	});

	let login = useMutation({
		mutationFn: fetchImplicitAccessToken,
		retry: false,

		onMutate() {
			showNotification({
				id: 'discord-auth',
				title: 'Awaiting approval',
				message: 'Need your explicit authorization to access to your Discord identity.',
				loading: true,
				autoClose: false,
				disallowClose: true,
			});
		},

		onSuccess(data) {
			setCredentials(data);
		},

		onError(error: Error) {
			updateNotification({
				id: 'discord-auth',
				title: 'Failure',
				message: error.message,
				color: 'red',
				icon: <IconX />,
				autoClose: 5000,
			});
		},
	});

	let profile = useQuery<Discord.Token>({
		queryKey: ['discord', 'profile', login.data],
		queryFn: async () => {
			let { token_type, access_token } = login.data!;
			return DiscordProfile.get(access_token);
		},
		enabled: !!login.data?.access_token,
		retry: false,

		onSuccess(data) {
			let { user } = data;
			updateNotification({
				id: 'discord-auth',
				title: 'Success',
				message: `Welcome ${user.username}#${user.discriminator}`,
				color: 'green',
				icon: <IconCheck />,
				autoClose: 5000,
			});
		},
	});

	let logout = () => {
		setCredentials(null);
		login.reset();
		profile.remove();
	};

	if (profile.isSuccess) {
		let { user } = profile.data;

		let avatar = (
			<Image radius="lg" width={32} src={DiscordProfile.getAvatarURL(user.id, user.avatar)} />
		);

		return (
			<SplitButton
				button={
					<Button fullWidth size="lg" leftIcon={avatar} color={'indigo.7'}>
						{`${user.username}#${user.discriminator}`}
					</Button>
				}
			>
				<Menu.Dropdown>
					<Menu.Item onClick={logout} icon={<IconSwitchHorizontal size={16} stroke={1.5} />}>
						Change Account
					</Menu.Item>
				</Menu.Dropdown>
			</SplitButton>
		);
	}

	return (
		<Button
			size="lg"
			loading={login.isLoading}
			leftIcon={<IconBrandDiscord />}
			onClick={() => login.mutate('')}
		>
			Connect Discord
		</Button>
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

	// @ts-expect-error TODO
	// eslint-disable-next-line no-unsafe-optional-chaining
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
		<SelectWalletButton size="lg" color="cyan" fullWidth>
			Connect Wallet to Claim
		</SelectWalletButton>
	) : (
		<Button
			size="lg"
			color="cyan"
			fullWidth
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

	return (
		<Flex p={{ sm: 60 }} align="center" direction="column">
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
						<Stack spacing="xs">
							<Input.Label sx={{ alignSelf: 'center' }}>Ends In</Input.Label>
							{raffle?.end_tz && <Countdown date={raffle?.end_tz} />}
						</Stack>
						<Stack spacing="xs" align="center">
							<Input.Label>Tickets Remaining</Input.Label>
							<Text>{`${String(remaining).padStart(3, '0')}/${raffle?.ticket_max}`}</Text>
						</Stack>

						<Stack px="md">
							<ConnectDiscordButton />
							{claimButton}
						</Stack>

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
