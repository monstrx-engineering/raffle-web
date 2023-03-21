/* eslint-disable prefer-const */
import {
	Box,
	Button,
	Card,
	Divider,
	Flex,
	Image,
	Input,
	Menu,
	SimpleGrid,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { hideNotification, showNotification, updateNotification } from '@mantine/notifications';
import { useWallet } from '@suiet/wallet-kit';
import { PostgrestError } from '@supabase/supabase-js';
import {
	IconArrowBack,
	IconBrandDiscord,
	IconCheck,
	IconSwitchHorizontal,
	IconX,
} from '@tabler/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
	fetchImplicitAccessToken,
	ImplicitGrantDone,
	Profile as DiscordProfile,
} from 'lib/discord';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { SelectWalletButton } from '~/components/ConnectButton';
import { Countdown } from '~/components/Countdown';
import { SplitButton } from '~/components/SplitButton';
import { WhitelistTable } from '~/components/WhitelistTable';
import { WinnerTable } from '~/components/WinnerTable';
import supabase from '~/lib/supabase';
import { queries, RaffleResponse } from '~/src/services';

export type RaffleDetailProps = { raffle: RaffleResponse };
export type RaffleDetailPageProps = { id: string | string[] | undefined };

const SUCCESS = {
	title: 'Success',
	color: 'green',
	icon: <IconCheck />,
};

const ERROR = {
	title: 'Error',
	color: 'red',
	icon: <IconX />,
};

const LOADING = {
	loading: true,
	autoClose: false,
	disallowClose: true,
};

function useClaimWhitelist(raffle_id: number) {
	return useMutation({
		mutationFn: async (address: string) => {
			if (!address) throw Error('no wallet connected');
			return supabase.from('participant').insert({ raffle_id, address }).throwOnError();
		},

		onSuccess(data, _, context) {
			showNotification({
				...SUCCESS,
				message: `Whitelist claimed!`,
			});
		},

		onError(error: PostgrestError) {
			switch (error.code) {
				case '23505':
					return { ...ERROR, message: `Already claimed!` };
				default:
					return { ...ERROR, message: error.message };
			}
		},
	});
}

const RaffleDetail = ({ raffle }: RaffleDetailProps) => {
	// @ts-ignore
	let raffleDeadline = new Date(raffle.end_tz).toJSON();
	let raffleHasEnded = !!raffleDeadline && raffleDeadline < new Date().toJSON();

	let remaining = useMemo(() => raffle.ticket_max - raffle.ticket_sold, [raffle]);

	let { mutate: claim } = useClaimWhitelist(raffle.id!);

	let [credentials, setCredentials] = useLocalStorage<ImplicitGrantDone | null>({
		key: 'discord-token',
		defaultValue: null,
	});

	let discordAuth = useMutation({
		mutationFn: fetchImplicitAccessToken,
		retry: false,

		onMutate: (state) => {
			let id = state || crypto.randomUUID();

			showNotification({
				...LOADING,
				id,
				title: 'Awaiting approval',
				message: 'Need your explicit authorization to access to your Discord identity.',
			});

			return { id };
		},

		onSuccess: (data, _, context) => {
			setCredentials(data);
			hideNotification(context?.id!);
		},

		onError: (error: Error, _, context) => {
			updateNotification({
				...ERROR,
				id: context?.id!,
				message: error.message,
			});
		},
	});

	let wallet = useWallet();

	const claimButton = wallet.address ? (
		<Button
			size="lg"
			color="cyan"
			onClick={() =>
				sign({
					url: window.location.host,
					wallet: wallet.address,
					discord: discordAccessToken,
				}).then(() => claim(wallet.address!))
			}
			disabled={remaining < 1 || raffleHasEnded}
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
	) : (
		<SelectWalletButton size="lg" color="cyan">
			Connect Wallet to Claim
		</SelectWalletButton>
	);

	const discordAccessToken = credentials?.access_token;
	let discordProfile = useQuery({
		queryKey: ['discord', 'profile', discordAccessToken],
		queryFn: () => DiscordProfile.get(discordAccessToken!),
		enabled: !!discordAccessToken,
		retry: false,

		onSuccess({ user }) {
			updateNotification({
				id: discordAuth.context?.id!,
				title: 'Success',
				color: 'green',
				icon: <IconCheck />,
				message: `Welcome ${user.username}#${user.discriminator}`,
			});
		},

		onError(e) {
			discordLogout();
		},
	});

	let discordLogout = () => {
		setCredentials(null);
		discordAuth.reset();
		discordProfile.remove();
	};

	let discordProfileData = discordProfile.data?.user;

	const discordAvatar = useMemo(
		() =>
			discordProfileData?.id && discordProfileData?.avatar ? (
				<Image
					radius="lg"
					width={32}
					src={DiscordProfile.getAvatarURL(discordProfileData.id, discordProfileData.avatar)}
				/>
			) : null,
		[discordProfileData?.id, discordProfileData?.avatar]
	);

	const discordButton = !discordProfileData ? (
		<Button
			size="lg"
			loading={discordAuth.isLoading}
			leftIcon={<IconBrandDiscord />}
			onClick={() => discordAuth.mutate('')}
		>
			Connect Discord
		</Button>
	) : (
		<SplitButton
			button={
				<Button fullWidth size="lg" color="indigo.7" leftIcon={discordAvatar}>
					{`${discordProfileData.username}#${discordProfileData.discriminator}`}
				</Button>
			}
		>
			<Menu.Dropdown>
				<Menu.Item onClick={discordLogout} icon={<IconSwitchHorizontal size={16} stroke={1.5} />}>
					Change Account
				</Menu.Item>
			</Menu.Dropdown>
		</SplitButton>
	);

	async function sign(metadata: Record<string, string>) {
		try {
			let message = new TextEncoder().encode(JSON.stringify(metadata));
			let { signature } = await wallet.signMessage({ message });
			let key = wallet.account?.publicKey!;

			let body = new Uint8Array(64 + 32 + message.byteLength);
			body.set(signature, 0);
			body.set(key, 64);
			body.set(message, 64 + 32);

			return await fetch('/api/verify', { method: 'POST', body }).then((r) => r.json());
		} catch (e) {
			console.error(e);
			throw e;
		}
	}

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
				<Image radius="lg" src={raffle.image} />

				<Card radius="lg" p="lg">
					<Stack pb={{ lg: 20, 560: 0 }} justify="space-between">
						<Title order={2} align="center">
							{raffle.name}
						</Title>

						{raffle.end_tz && (
							<Stack spacing="xs">
								<Input.Label sx={{ alignSelf: 'center' }}>Ends In</Input.Label>
								<Countdown date={raffle.end_tz} />
							</Stack>
						)}

						<Stack spacing="xs" align="center">
							<Input.Label>Tickets Remaining</Input.Label>
							<Text>{`${String(remaining).padStart(3, '0')}/${raffle.ticket_max}`}</Text>
						</Stack>

						<Stack px="md">
							{discordButton}
							{claimButton}
						</Stack>

						{Boolean(raffle.winner) && raffle.winner != 'TBA' && (
							<Stack spacing={0}>
								<Divider my="lg" />

								<Title order={4} align="center">
									Winner
								</Title>

								<WinnerTable winners={raffle.winner.split(/\s+/)} />
							</Stack>
						)}
					</Stack>
				</Card>
			</SimpleGrid>

			{raffle?.id && !raffleHasEnded && <WhitelistTable raffleId={raffle.id} />}
		</Flex>
	);
};

const RaffleDetailPage: NextPage<RaffleDetailPageProps> = (props) => {
	let router = useRouter();

	let param = props.id || router.query.id;
	let id = Array.isArray(param) ? param[0] : param;

	let { data: raffle, isSuccess } = useQuery({ ...queries.raffles.detail(id!), enabled: !!id });

	if (!isSuccess || !raffle) return null;

	return <RaffleDetail raffle={raffle} />;
};

RaffleDetailPage.getInitialProps = ({ query }) => ({ id: query.id });

export default RaffleDetailPage;
