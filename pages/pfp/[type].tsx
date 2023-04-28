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
						<Image src={image} width={388} height={388} withPlaceholder placeholder={<Loader />} />
					) : (
						<Box w={388} h={388}  />
					)}
					<Button onClick={generate}>Generate</Button>
				</Stack>
				<Card sx={{ flex: 1 }} styles={{ root: {} }}>
					<h3>PFP Generator</h3>
					<h5>{String(type).toUpperCase()}</h5>

					<h3>Description</h3>
					<p>
						{function () {
							switch (type) {
								case 'nusku':
									return `Nusku has the ability to control the power of fire, using it to create powerful flames, scorching heat, and even summon destructive infernos. He spent his time in the fighting ring at The Eden. He never wanted to hurt anyone, but he loved the adrenaline of being in a fight`;
								case 'enki':
									return `Enki has the ability to control and manipulate water, using it to summon powerful tidal waves, create devastating floods, and even control the weather. It is a graceful and powerful creature, but also possesses a calm and serene nature that makes it a valuable ally to those who respect its power`;
								case 'venti':
									return `Venti mastering the winds & storm, a free-spirited entity, enjoy playing songs, whose mischievous nature and sing-song attitude can sometimes irritate others around him with how flippant she is`;
								case 'hyperion':
									return `The God of Heavenly Light `;
								case 'yugaea':
									return `God of heavenly light & depicted as a handsome young man crowned with the shining aureole of the Sun who watch the earth across the sky everydayYugaea is an earth elemental, he’s the real definition of cheerful and joyful, he brings happiness to other MonstrS and living being on earth, he loves being outside with his best mate Enki and digging in their earth to discover how civilizations flourished or fell.`;
								case 'noface':
									return `Spirit represents the power of positivity and kindness, Its body is translucent, and it seems to be made up of pure energy. Spirit has the ability to manipulate the spiritual energies of the world, using them to heal wounds, dispel curses, and summon powerful protective wards. It is a gentle and benevolent creature, but also possesses a fearsome power that can overwhelm those who threaten it or its allies.`;
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
