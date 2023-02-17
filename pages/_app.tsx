import { MantineProvider } from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';
import type { NextPage } from 'next';
import type { AppProps as NextAppProps } from 'next/app';
import Head from 'next/head';
import type { ReactElement, ReactNode } from 'react';
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
};

const colors = {};

export default function App(props: AppProps) {
	const { Component, pageProps } = props;

	const getLayout = Component.getLayout ?? ((page) => <Layout>{page}</Layout>);

	return (
		<>
			<Head>
				<title>SUI Monstrx</title>
				<meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
				<link rel="shortcut icon" href="/favicon.ico" />
			</Head>

			<MantineProvider theme={{ colors, colorScheme: 'dark' }} withGlobalStyles withNormalizeCSS>
				<NotificationsProvider>
					<ReactQueryProvider>
						<WalletProvider>{getLayout(<Component {...pageProps} />)}</WalletProvider>
					</ReactQueryProvider>
				</NotificationsProvider>
			</MantineProvider>
		</>
	);
}
