import {
	Badge,
	Card,
	createPolymorphicComponent,
	Group,
	Image,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import React, { forwardRef } from 'react';
// eslint-disable-next-line
import { Creator, Sales } from './/src/types/raffle';

export type RaffleCardProps = {
	name: string;
	chain: string;
	image: string;
	sales: Sales;
	creator: Creator;
};

const LabeledText = ({ label, text }) => (
	<Stack spacing={0}>
		<Text size={10} c="gray.6">
			{label}
		</Text>
		<Text size={14} fw={700}>
			{text}
		</Text>
	</Stack>
);

export const RaffleCard = createPolymorphicComponent<'div', RaffleCardProps>(
	forwardRef<HTMLDivElement, RaffleCardProps>(
		({ name, chain, image, sales, creator, ...props }, ref) => {
			return (
				<Card ref={ref} component="div" radius="lg" {...props}>
					<Stack spacing="xs">
						<Image radius="md" src={image} />
						<Group position="apart">
							<Title order={5}>{name}</Title>
							<Badge color="blue.3" variant="filled">
								{chain}
							</Badge>
						</Group>
						<Group position="apart">
							<Group spacing="xs">
								<Image width={32} src={creator.avatar} />
								<LabeledText label="Creator" text={creator.name} />
							</Group>
							<LabeledText label="Price/Ticket" text={sales.price.toString()} />
						</Group>

						<Stack spacing={0} align="center">
							{/* <Text size={10} c="gray.6">
								Tickets Remaining
							</Text>
							<Text size={14} fw={700}>
								{sales.supply.remaining}/{sales.supply.max}
							</Text> */}
						</Stack>
					</Stack>
				</Card>
			);
		}
	)
);
