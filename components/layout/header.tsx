/* eslint-disable prefer-const */
import { ActionIcon, Group, Header, MediaQuery, Title } from "@mantine/core";
import { IconBrandDiscord, IconBrandTwitter } from "@tabler/icons";
import { ColorSchemeToggle } from "../ColorSchemeToggle/ColorSchemeToggle";
import { ConnectButton } from "../ConnectButton";

let IconButton = ({ size, color, icon: Icon, radius = Math.floor(size / 2), ...props }) => (
	<ActionIcon {...props} color={color} variant="filled" radius={radius} size={size}>
		<Icon size={radius - 2} />
	</ActionIcon>
);

export function DefaultHeader() {
	return (
		<Header height={60}>
			<Group sx={{ height: "100%" }} px={20} position="apart">
				<Group>
					<Title order={2} mr="sm">
						SuiMonstrx
					</Title>
					<IconButton
						component="a"
						href={process.env.NEXT_PUBLIC_TWITTER_URL}
						target="_blank"
						color="blue.5"
						size={32}
						icon={IconBrandTwitter}
					/>
					<IconButton
						component="a"
						href={process.env.NEXT_PUBLIC_DISCORD_URL}
						target="_blank"
						color="indigo.7"
						size={32}
						icon={IconBrandDiscord}
					/>
				</Group>
				<MediaQuery smallerThan="sm" styles={{ display: "none" }}>
					<Group spacing={6}>
						<ConnectButton />
						<ColorSchemeToggle />
					</Group>
				</MediaQuery>
			</Group>
		</Header>
	);
}
