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
import { NotificationProps, showNotification, updateNotification } from '@mantine/notifications';
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
import { getCookie, hasCookie } from 'cookies-next';
import { isPast, parseISO } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { SelectWalletButton } from '~/components/ConnectButton';
import { Countdown } from '~/components/Countdown';
import { SplitButton } from '~/components/SplitButton';
import { WhitelistTable } from '~/components/WhitelistTable';
import { WinnerTable } from '~/components/WinnerTable';
import { fetchImplicitAccessToken, ImplicitGrantDone } from '~/lib/discord/implicitGrant';
import * as DiscordProfile from '~/lib/discord/profile';
import supabase from '~/lib/supabase';
import { queries } from '~/src/services';

function useClaimWhitelist(id: string) {
	return useMutation({
		mutationFn: async (address: string) => {
			return supabase
				.from('participant')
				.insert({ raffle_id: Number(id), address })
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

function useNotification(initialId?: string) {
	const [id] = useState(initialId || window.crypto.randomUUID());

	return useMemo(
		() => ({
			loading(options: NotificationProps) {
				return showNotification({
					id,
					loading: true,
					autoClose: false,
					disallowClose: true,
					...options,
				});
			},
			success(options: NotificationProps) {
				return updateNotification({
					id,
					title: 'Success',
					color: 'green',
					icon: <IconCheck />,
					autoClose: 5000,
					...options,
				});
			},
			error(options: NotificationProps) {
				return updateNotification({
					id,
					title: 'Failure',
					color: 'red',
					icon: <IconX />,
					autoClose: 5000,
					...options,
				});
			},
		}),
		[id]
	);
}

function RaffleDetail({ raffleId }: { raffleId: string }) {
	let { data: raffle } = useQuery({
		...queries.raffles.detail(raffleId),
	});

	let remaining = useMemo(() => {
		// @ts-expect-error TODO
		return raffle?.ticket_max - raffle?.ticket_sold;
	}, [raffle?.ticket_max, raffle?.ticket_sold]);

	let deadlinePassed = raffle && raffle.end_tz && isPast(parseISO(raffle.end_tz));

	let wallet = useWallet();

	let { mutate: claim } = useClaimWhitelist(raffleId);

	let [credentials, setCredentials] = useLocalStorage<ImplicitGrantDone | null>({
		key: 'discord-token',
		defaultValue: null,
	});

	let notification = useNotification();

	let discordAuth = useMutation({
		mutationFn: fetchImplicitAccessToken,
		retry: false,

		onSuccess: (data) => setCredentials(data),

		onMutate: () => {
			notification.loading({
				title: 'Awaiting approval',
				message: 'Need your explicit authorization to access to your Discord identity.',
			});
		},

		onError: (error: Error) => notification.error({ message: error.message }),
	});

	const discordAccessToken = credentials?.access_token;
	let discordProfile = useQuery({
		queryKey: ['discord', 'profile', discordAccessToken],
		queryFn: () => DiscordProfile.get(discordAccessToken!),
		enabled: !!discordAccessToken,
		retry: false,

		onSuccess({ user }) {
			notification.success({ message: `Welcome ${user.username}#${user.discriminator}` });
		},
	});

	let discordLogout = () => {
		setCredentials(null);
		discordAuth.reset();
		discordProfile.remove();
	};

	let discordProfileData = discordProfile.data?.user;

	async function sign() {
		try {
			let metadata = {
				url: window.location.host,
				wallet: wallet.address,
				discord: discordAccessToken,
			};

			let message = new TextEncoder().encode(JSON.stringify(metadata));
			let { signature } = await wallet.signMessage({ message });
			let key = wallet.account?.publicKey!;

			let body = new Uint8Array(64 + 32 + message.byteLength);
			body.set(signature, 0);
			body.set(key, 64);
			body.set(message, 64 + 32);

			return fetch('/api/verify', { method: 'POST', body }).then((r) => r.json());
		} catch (e) {
			console.error(e);
			throw e;
		}
	}

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

						<Stack px="md">
							{!discordProfileData ? (
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
										<Button
											fullWidth
											size="lg"
											leftIcon={
												<Image
													radius="lg"
													width={32}
													src={DiscordProfile.getAvatarURL(
														discordProfileData.id,
														discordProfileData.avatar
													)}
												/>
											}
											color={'indigo.7'}
										>
											{`${discordProfileData.username}#${discordProfileData.discriminator}`}
										</Button>
									}
								>
									<Menu.Dropdown>
										<Menu.Item
											onClick={discordLogout}
											icon={<IconSwitchHorizontal size={16} stroke={1.5} />}
										>
											Change Account
										</Menu.Item>
									</Menu.Dropdown>
								</SplitButton>
							)}
							{!wallet.address ? (
								<SelectWalletButton size="lg" color="cyan" fullWidth>
									Connect Wallet to Claim
								</SelectWalletButton>
							) : (
								<Button
									size="lg"
									color="cyan"
									fullWidth
									onClick={() => {
										sign().then(() => claim(wallet.address!));
									}}
								>
									Claim whitelist
								</Button>
							)}
							<pre>{JSON.stringify(getCookie('monstrx-token'))}</pre>
						</Stack>

						{deadlinePassed && raffle?.winner && (
							<section>
								<Divider my="lg" />
								<Title order={4} align="center">
									Winner
								</Title>
								<WinnerTable winners={raffle?.winner?.split(/\s+/) ?? []} />
							</section>
						)}
					</Stack>
				</Card>
			</SimpleGrid>

			{!deadlinePassed && remaining > 0 && <WhitelistTable raffleId={raffleId} />}
		</Flex>
	);
}

export default function RaffleDetailPage() {
	const router = useRouter();
	const { id } = router.query;

	return typeof id === 'string' && id && <RaffleDetail raffleId={id} />;
}
