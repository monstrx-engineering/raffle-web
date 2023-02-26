/* eslint-disable prefer-const */
import { Container, Group, Header, Image, MediaQuery } from '@mantine/core';
import { ConnectButton } from '../ConnectButton';
import Link from 'next/link';

const BG = {
	background: `
		url('/spirit.webp') 
		top 51% left 50% / 120px auto
		rgba(123, 192, 255, 0.8)
	`,
	backgroundBlendMode: 'multiply',
};

export function DefaultHeader({ height = 97 }) {
	return (
		<Header bg="dark.8" height={height}>
			<Container px={32} size="xl">
				<Group position="apart" h={height}>
					<Group>
						<Image width={97} src="/logo.png" />
					</Group>

					<MediaQuery smallerThan="xs" styles={{ display: 'none' }}>
						<Group
							sx={{
								a: {
									color: 'white',
									textDecoration: 'none',
									'&:hover': { textDecoration: 'underline' },
								},
							}}
						>
							<Link href="//suimonstrx.xyz">Home</Link>
							<Link href="//raffle.suimonstrx.xyz">Raffle</Link>
							<Link href="//linktr.ee/SuiMonstrX">Resources</Link>
						</Group>
					</MediaQuery>

					<ConnectButton
						h={48}
						w={148}
						radius={12}
						styles={{
							root: { ...BG, '&:hover': BG },
						}}
					/>
				</Group>
			</Container>
		</Header>
	);
}
