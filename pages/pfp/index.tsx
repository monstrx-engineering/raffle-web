import { AspectRatio, Card, Container, Group, Text } from '@mantine/core';
import Link from 'next/link';

function TypeCard({ type }: { type: string }) {
	return (
		<Link href={`/pfp/${type}`}>
			<AspectRatio ratio={200 / 640} mih={600}>
				<Card bg={`url('/${type}.png')`} bgp="38% bottom" bgsz="280%" bgr="no-repeat" withBorder>
					<Text c="white" sx={{ textTransform: 'uppercase', alignSelf: 'flex-start' }}>
						{type}
					</Text>
				</Card>
			</AspectRatio>
		</Link>
	);
}

export default function ProfilePicturePage() {
	return (
		<Container py={60} size="xl" h="100%" display="flex">
			<Group position="apart" grow sx={{ flex: 1 }}>
				<TypeCard type="hyperion" />
				<TypeCard type="noface" />
				<TypeCard type="nusku" />
				<TypeCard type="enki" />
				{/* <TypeCard name="venti" /> */}
				<TypeCard type="yugaea" />
			</Group>
		</Container>
	);
}
