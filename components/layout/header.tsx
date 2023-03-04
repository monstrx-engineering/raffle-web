/* eslint-disable prefer-const */
import { Container, Group, Header, Image, MediaQuery } from '@mantine/core';
import Link from 'next/link';
import { ConnectButton } from '../ConnectButton';

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
					<Image width={97} src="/logo.png" />

					<Group>
						<MediaQuery smallerThan="xs" styles={{ display: 'none' }}>
							<Group
								mr={40}
								sx={{
									a: {
										color: 'white',
										textDecoration: 'none',
										'&:hover': { textDecoration: 'underline' },
									},
								}}
							>
								<Link href="https://suimonstrx.xyz">Home</Link>
								<Link href="https://raffle.suimonstrx.xyz">Raffle</Link>
								<Link href="https://linktr.ee/SuiMonstrX">Resources</Link>
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
				</Group>
			</Container>
		</Header>
	);
}
