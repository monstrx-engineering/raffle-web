import { ActionIcon, useMantineColorScheme } from "@mantine/core";
import { IconMoonStars, IconSun } from "@tabler/icons";

export function ColorSchemeToggle({ size = 36 }) {
	const { colorScheme, toggleColorScheme } = useMantineColorScheme();

	return (
		<ActionIcon
			onClick={() => toggleColorScheme()}
			size={size}
			sx={(theme) => ({
				backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
				color: theme.colorScheme === "dark" ? theme.colors.yellow[4] : theme.colors.blue[6],
			})}
		>
			{colorScheme === "dark" ? (
				<IconSun size={20} stroke={1.5} />
			) : (
				<IconMoonStars size={20} stroke={1.5} />
			)}
		</ActionIcon>
	);
}
