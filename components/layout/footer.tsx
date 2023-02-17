import {
	ActionIcon,
	Box,
	Container,
	Group,
	Image,
	Input,
	Stack,
	Text,
	createStyles,
} from '@mantine/core';
import { IconArrowRight, IconBrandDiscord, IconBrandTwitter } from '@tabler/icons';

const useStyles = createStyles((theme) => ({
	logo: {
		maxWidth: 200,

		[theme.fn.smallerThan('sm')]: {
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'flex-start',
			alignItems: 'center',
		},
	},

	description: {
		marginTop: -20,

		[theme.fn.smallerThan('sm')]: {
			textAlign: 'center',
		},
	},

	inner: {
		display: 'flex',
		justifyContent: 'space-between',

		[theme.fn.smallerThan('sm')]: {
			flexDirection: 'column',
			alignItems: 'center',
		},
	},

	groups: {
		display: 'flex',
		flexWrap: 'wrap',

		[theme.fn.smallerThan('sm')]: {
			display: 'none',
		},
	},

	wrapper: {
		width: 160,
	},

	link: {
		display: 'block',
		color: theme.colorScheme === 'dark' ? theme.colors.dark[1] : theme.colors.gray[6],
		fontSize: theme.fontSizes.sm,
		paddingTop: 3,
		paddingBottom: 3,

		'&:hover': {
			textDecoration: 'underline',
		},
	},

	title: {
		fontSize: theme.fontSizes.lg,
		fontWeight: 700,
		fontFamily: `Greycliff CF, ${theme.fontFamily}`,
		marginBottom: theme.spacing.xs / 2,
		color: theme.colorScheme === 'dark' ? theme.white : theme.black,
	},

	afterFooter: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: theme.spacing.xl,
		paddingTop: theme.spacing.xl,
		paddingBottom: theme.spacing.xl,
		borderTop: `1px solid ${
			theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]
		}`,

		[theme.fn.smallerThan('sm')]: {
			flexDirection: 'column',
		},
	},

	social: {
		[theme.fn.smallerThan('sm')]: {
			marginTop: theme.spacing.xs,
		},
	},
}));

interface Data {
	title: string;
	links: { label: string; link: string }[];
}

let data: Data[] = [
	{
		title: 'Explore',
		links: [
			{
				label: 'Raffle',
				link: '#',
			},
			{
				label: 'Home',
				link: '#',
			},
			{
				label: 'Resources',
				link: '#',
			},
		],
	},
	{
		title: 'Mint',
		links: [
			{
				label: 'Clutchy Tesnet',
				link: '#',
			},
		],
	},
	{
		title: 'Community',
		links: [
			{
				label: 'Join Discord',
				link: '#',
			},
			{
				label: 'Follow on Twitter',
				link: '#',
			},
			{
				label: 'GitHub discussions',
				link: '#',
			},
		],
	},
];

export function DefaultFooter() {
	const { classes } = useStyles();

	const groups = data.map((group) => {
		const links = group.links.map((link, index) => (
			<Text<'a'>
				key={index}
				className={classes.link}
				component="a"
				href={link.link}
				onClick={(event) => event.preventDefault()}
			>
				{link.label}
			</Text>
		));

		return (
			<div className={classes.wrapper} key={group.title}>
				<Text className={classes.title}>{group.title}</Text>
				{links}
			</div>
		);
	});

	return (
		<Box component="footer" sx={(theme) => ({ borderTop: `1px solid ${theme.colors.dark[5]}` })}>
			<Container className={classes.inner} p={32} size="xl">
				<Stack justify="space-between" className={classes.logo}>
					<Image width={56} src="/spirit.webp" mb="md" />
					<Text size="xs" color="dimmed" className={classes.description}>
						© 2023 Monstrx.
					</Text>

					<Group spacing={0} className={classes.social} noWrap>
						<ActionIcon size="lg">
							<IconBrandTwitter size={18} stroke={1.5} />
						</ActionIcon>
						<ActionIcon size="lg">
							<IconBrandDiscord size={18} stroke={1.5} />
						</ActionIcon>
					</Group>
				</Stack>
				<div className={classes.groups}>
					{groups}
					<div className={classes.wrapper}>
						<Text className={classes.title}>Get Notified</Text>
						<Input
							rightSection={
								<ActionIcon variant="filled">
									<IconArrowRight size={18} stroke={1.5} />
								</ActionIcon>
							}
						/>
					</div>
				</div>
			</Container>
		</Box>
	);
}
