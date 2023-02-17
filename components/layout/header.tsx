/* eslint-disable prefer-const */
import { Container, Group, Header, Image, MediaQuery } from '@mantine/core';
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
					<Group>
						<Image height={67} src="/logo.png" />
					</Group>

					<Group
						sx={{
							a: {
								color: 'white',
								textDecoration: 'none',
								'&:hover': { textDecoration: 'underline' },
							},
						}}
					>
						{/* <Link href="/">Home</Link> */}
						{/* <Link href="/">Raffle</Link> */}
						{/* <Link href="/">Resources</Link> */}
					</Group>

					<ConnectButton
						h={48}
						w={148}
						radius={12}
						styles={{
							root: { ...BG, '&:hover': BG },
						}}
					/>

					<MediaQuery smallerThan="sm" styles={{ display: 'none' }}>
						<></>
					</MediaQuery>
				</Group>
			</Container>
		</Header>
	);
}
