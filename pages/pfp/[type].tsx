import { Box, Button, Card, Container, Group, Image, Loader, Stack } from '@mantine/core';
import { useRouter } from 'next/router';
import { useState } from 'react';

const DOMAIN = process.env.NEXT_PUBLIC_SUPABASE_URL!;

export default function TypeDetailPage() {
	let { query } = useRouter();

	let type: string = query.type as string;

	let [image, setImage] = useState(``);

	function getRandomImage() {
		let i = Math.ceil(Math.random() * 255);
		if (type === 'hyperion' || type === 'venti') {
			i = 1;
		}
		return `${DOMAIN}/storage/v1/object/public/image/${type}/${i}.png`;
	}

	let generate = () => {
		setImage(getRandomImage());
	};

	return (
		<Container py={60} size="lg">
			<Group spacing="lg">
				<Stack>
					{image ? (
						<Image src={image} width={400} height={400} withPlaceholder placeholder={<Loader />} />
					) : (
						<Box w={400} h={400} sx={{ border: `.1px solid white` }} />
					)}
					<Button onClick={generate}>Generate</Button>
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
