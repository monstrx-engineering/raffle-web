import { Card, Container, Image, SimpleGrid, Title } from '@mantine/core';
import Link from 'next/link';

function TypeCard({ name }) {
	return (
		<Link href={`/pfp/${name}`}>
			<Card bg={`url('/${name}.png')`} bgp="38% bottom" bgsz="280%" bgr="no-repeat" withBorder>
				<Card.Section pt="sm">
					<Title order={6} c="white" sx={{ textTransform: 'uppercase', textAlign: 'center' }}>
						{name}
					</Title>
				</Card.Section>
			</Card>
		</Link>
	);
}

export default function ProfilePicturePage() {
	return (
		<Container py={60} size="xl" h="100%">
			<SimpleGrid cols={6} h="100%" sx={{ flex: 1 }}>
				<TypeCard name="hyperion" />
				<TypeCard name="noface" />
				<TypeCard name="nusku" />
				<TypeCard name="enki" />
				<TypeCard name="venti" />
				<TypeCard name="yugaea" />
			</SimpleGrid>
		</Container>
	);
}
