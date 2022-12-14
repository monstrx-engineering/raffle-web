import { PropsWithChildren, useState } from 'react';
import { useColorScheme } from '@mantine/hooks';
import { ColorScheme, ColorSchemeProvider, MantineProvider } from '@mantine/core';
import { setCookie } from 'cookies-next';
import { NotificationsProvider } from '@mantine/notifications';
import { WalletProvider } from '@suiet/wallet-kit';
import { ReactQueryProvider } from '../../modules/react-query';

export function Providers(props: PropsWithChildren<{ colorScheme: ColorScheme }>) {
	const preferredColorScheme = useColorScheme('dark', { getInitialValueInEffect: false });
	const [colorScheme, setColorScheme] = useState<ColorScheme>(
		props.colorScheme ?? preferredColorScheme
	);

	const toggleColorScheme = (value?: ColorScheme) => {
		const nextColorScheme = value || (colorScheme === 'dark' ? 'light' : 'dark');
		setColorScheme(nextColorScheme);
		setCookie('mantine-color-scheme', nextColorScheme, {
			maxAge: 60 * 60 * 24 * 30,
		});
	};

	return (
		<ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
			<MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
				<NotificationsProvider>
					<ReactQueryProvider>
						<WalletProvider>{props.children}</WalletProvider>
					</ReactQueryProvider>
				</NotificationsProvider>
			</MantineProvider>
		</ColorSchemeProvider>
	);
}
