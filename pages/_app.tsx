import { ColorScheme, ColorSchemeProvider, MantineProvider } from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';
import { getCookie, setCookie } from 'cookies-next';
import type { GetServerSidePropsContext, NextPage } from 'next';
import type { AppProps as NextAppProps } from 'next/app';
import Head from 'next/head';
import type { ReactElement, ReactNode } from 'react';
import { useState } from 'react';
import { Layout } from '~/components/layout';
import { ReactQueryProvider } from '~/lib/react-query';

import { WalletProvider } from '@suiet/wallet-kit';
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

	const [colorScheme, setColorScheme] = useState<ColorScheme>(props.colorScheme);
	const toggleColorScheme = (value?: ColorScheme) => {
		const nextColorScheme = value || (colorScheme === 'dark' ? 'light' : 'dark');
		setColorScheme(nextColorScheme);
		setCookie('mantine-color-scheme', nextColorScheme, { maxAge: 30 * 24 * 60 * 60 });
	};

	return (
		<>
			<Head>
				<title>SUI Monstrx</title>
				<meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
				<link rel="shortcut icon" href="/favicon.ico" />
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

App.getInitialProps = ({ ctx }: { ctx: GetServerSidePropsContext }) => ({
	// get color scheme from cookie
	colorScheme: getCookie('mantine-color-scheme', ctx) || 'light',
});
