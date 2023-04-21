import { Button, Card, Container, Group, Image, Stack, Title } from '@mantine/core';
import { useRouter } from 'next/router';

export default function TypeDetailPage() {
	let {
		query: { type },
	} = useRouter();

	return (
		<Container py={60} size="xl">
			<Group spacing="lg">
				<Stack>
					<Image src={`/${type}.png`} width={450} />
					<Button>Generate</Button>
				</Stack>
				<Card sx={{ flex: 1 }}>
					<h2>PFP Generator</h2>
					<h5>{String(type).toUpperCase()}</h5>

					<p>blabla</p>
				</Card>
			</Group>
		</Container>
	);
}
