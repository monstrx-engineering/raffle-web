/* eslint-disable prefer-const */
import {
	ActionIcon,
	AppShell,
	Button,
	Center,
	Container,
	createStyles,
	Flex,
	Grid,
	Group,
	Header,
	Image,
	MediaQuery,
	SimpleGrid,
	Stack,
	Text,
	Textarea,
	TextInput,
	Title,
	useMantineTheme,
} from "@mantine/core";
import { useWallet } from "@suiet/wallet-kit";
import { IconBrandDiscord, IconBrandTwitter } from "@tabler/icons";
import { ColorSchemeToggle } from "../components/ColorSchemeToggle/ColorSchemeToggle";
import { ConnectButton, SelectWalletButton } from "../components/ConnectButton";

let IconButton = ({ size, color, icon: Icon, radius = Math.floor(size / 2), ...props }) => (
	<ActionIcon {...props} color={color} variant="filled" radius={radius} size={size}>
		<Icon size={radius - 2} />
	</ActionIcon>
);

function DefaultHeader() {
	return (
		<Header height={60}>
			<Group sx={{ height: "100%" }} px={20} position="apart">
				<Group>
					<Title order={2} mr="sm">
						SuiMonstrx
					</Title>
					<IconButton
						component="a"
						href="https://twitter.com/suiMonstrX"
						target="_blank"
						color="blue.5"
						size={32}
						icon={IconBrandTwitter}
					/>
					<IconButton
						component="a"
						href="https://discord.gg/aKeuDUyJpy"
						target="_blank"
						color="indigo.7"
						size={32}
						icon={IconBrandDiscord}
					/>
				</Group>
				<MediaQuery smallerThan="sm" styles={{ display: "none" }}>
					<Group spacing={6}>
						<ConnectButton />
						<ColorSchemeToggle />
					</Group>
				</MediaQuery>
			</Group>
		</Header>
	);
}

const useStyles = createStyles((theme) => ({
	wrapper: {
		padding: theme.spacing.xl * 2.5,

		[`@media (max-width: ${theme.breakpoints.sm}px)`]: {
			padding: theme.spacing.xl * 1.5,
		},
	},

	form: {
		backgroundColor: theme.white,
		padding: theme.spacing.xl,
		borderRadius: theme.radius.lg,
		boxShadow: theme.shadows.lg,
	},
}));

export function Main() {
	let { classes } = useStyles();
	let wallet = useWallet();

	return (
		<div className={classes.wrapper}>
			<Center>
				<SimpleGrid
					maw={{ lg: 960, 560: 480 }}
					cols={2}
					spacing={50}

					breakpoints={[{ maxWidth: "lg", cols: 1 }]}
				>
					<Image
						radius="lg"
						src="https://raffle.aptosglitchlabs.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdgkmpl9iw%2Fimage%2Fupload%2Fv1667597404%2F1696_41708f0ac3.png&w=3840&q=75"
					/>

					<Stack className={classes.form}>
						<TextInput label="Email" placeholder="your@email.com" required />
						<TextInput label="Name" placeholder="John Doe" mt="md" />
						<Flex mt="md">
							{wallet.connected ? <Button>Claim whitelist</Button> : <SelectWalletButton />}
						</Flex>
					</Stack>
				</SimpleGrid>
			</Center>
		</div>
	);
}

export default function HomePage() {
	const theme = useMantineTheme();

	return (
		<AppShell
			styles={{
				main: {
					background: theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.colors.gray[0],
				},
			}}
			header={<DefaultHeader />}
		>
			<Main />
		</AppShell>
	);
}
