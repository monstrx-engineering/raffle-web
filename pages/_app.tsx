import type { ReactElement, ReactNode } from 'react';
import type { NextPage } from 'next';
import type { AppContext, AppProps as NextAppProps } from 'next/app';
import NextApp from 'next/app';
import Head from 'next/head';
import { getCookie } from 'cookies-next';
import { Layout } from '~/components/layout';
import { useState } from 'react';
import { useColorScheme } from '@mantine/hooks';
import { ColorScheme, ColorSchemeProvider, MantineProvider } from '@mantine/core';
import { setCookie } from 'cookies-next';
import { NotificationsProvider } from '@mantine/notifications';
import { WalletProvider } from '@suiet/wallet-kit';
import { ReactQueryProvider } from '~/lib/react-query';

import '@suiet/wallet-kit/style.css';
import '../components/ConnectButton/suiet-wallet-kit-custom.css';

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
	getLayout?: (page: ReactElement) => ReactNode;
};

type AppProps = NextAppProps & {
	Component: NextPageWithLayout;
	colorScheme: ColorScheme;
};

export default function App(props: AppProps) {
	const { Component, pageProps } = props;

	const getLayout = Component.getLayout ?? ((page) => <Layout>{page}</Layout>);

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
		<>
			<Head>
				<title>Mantine next example</title>
				<meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
				<link rel="shortcut icon" href="/favicon.svg" />
			</Head>

			<ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
				<MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
					<NotificationsProvider>
						<ReactQueryProvider>
							<WalletProvider>{getLayout(<Component {...pageProps} />)}</WalletProvider>
						</ReactQueryProvider>
					</NotificationsProvider>
				</MantineProvider>
			</ColorSchemeProvider>
		</>
	);
}

App.getInitialProps = async (appContext: AppContext) => {
	const appProps = await NextApp.getInitialProps(appContext);
	return {
		...appProps,
		colorScheme: getCookie('mantine-color-scheme', appContext.ctx),
	};
};
