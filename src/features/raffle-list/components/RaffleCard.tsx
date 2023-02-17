import {
	Badge,
	Card,
	Center,
	createStyles,
	Group,
	Image,
	Stack,
	StackProps,
	Text,
	Title,
} from '@mantine/core';
import { intlFormatDistance } from 'date-fns';
import { forwardRef } from 'react';
import { Creator, Sales } from '~/src/types/raffle';

export type RaffleCardProps = {
	name: string;
	chain: string;
	image: string;
	sales: Sales;
	creator: Creator;
};

const useStyles = createStyles((theme) => ({
	wrapper: {
		display: 'flex',
		flexDirection: 'column',
		background: 'unset',
		border: '1px solid #333',

		'*': { color: 'white' },
	},
	content: {
		flexGrow: 1,
		justifyContent: 'space-between',
		padding: theme.spacing.md,
		paddingTop: 7,
	},
}));

const LabeledText = ({ label, text, ...props }: { label: string; text: string } & StackProps) => (
	<Stack spacing={0} {...props}>
		<Text size={12} c="#8F9CA9">
			{label}
		</Text>
		<Text size={12} fw={700}>
			{text}
		</Text>
	</Stack>
);

const Pill = ({ children }) => (
	<Badge bg="#0F182E" pos="absolute" bottom={10}>
		{children}
	</Badge>
);

export const RaffleCard = forwardRef<HTMLDivElement, RaffleCardProps>((props, ref) => {
	let { name, chain, image, sales, creator, ...rest } = props;
	let { classes } = useStyles();
	return (
		<Card ref={ref} radius={24} p={0} className={classes.wrapper} {...rest}>
			<Card.Section component={Center} pos="relative">
				<Image src={image} />
				<Pill>Ends {intlFormatDistance(sales.endDate, Date.now())}</Pill>
			</Card.Section>

			<Stack spacing="xs" className={classes.content}>
				<Group position="apart" spacing={0} noWrap>
					<Title order={5}>{name}</Title>
					<Badge bg="blue.3" sx={{ flexShrink: 0 }}>
						{chain}
					</Badge>
				</Group>
				<Group position="apart">
					<Group spacing="xs">
						<Image radius={18} width={36} src={creator.avatar} />
						<LabeledText label="Creator" text={creator.name} />
					</Group>
					<LabeledText align="flex-end" label="Price/Ticket" text={sales.price.toString()} />
				</Group>

				<LabeledText
					align="center"
					label="Tickets Remaining"
					text={`${sales.supply.remaining}/${sales.supply.max}`}
				/>
			</Stack>
		</Card>
	);
});
