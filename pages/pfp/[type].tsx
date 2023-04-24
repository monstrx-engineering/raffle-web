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
					<h3>PFP Generator</h3>
					<h5>{String(type).toUpperCase()}</h5>

					<h3>Description</h3>
					<p>
						{function () {
							switch (type) {
								case 'nusku':
									return `Nusku is a fierce and powerful monster that is imbued with the element of fire. Its hand radiates with intense heat, and its eyes glow with a fierce intensity. Nusku has the ability to control the power of fire, using it to create powerful flames, scorching heat, and even summon destructive infernos. It is a fearsome opponent that can cause massive destruction with its powers, but can also be a powerful ally to those who join the cult as a warlock.`;
							}
						}.call()}
					</p>

					<h3>How To</h3>
					<ol style={{ marginLeft: 20, padding: 0 }}>
						<li>Just click generate</li>
						<li>Save as!</li>
					</ol>
				</Card>
			</Group>
		</Container>
	);
}
