import type { ReactElement, ReactNode } from 'react';
import type { NextPage } from 'next';
import type { AppContext, AppProps as NextAppProps } from 'next/app';
import NextApp from 'next/app';
import { getCookie } from 'cookies-next';
import Head from 'next/head';

import { ColorScheme } from '@mantine/core';
import '@suiet/wallet-kit/style.css';
import '../components/ConnectButton/suiet-wallet-kit-custom.css';
import { Layout } from '../components/layout';
import { Providers } from '../components/providers';

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

	return (
		<>
			<Head>
				<title>Mantine next example</title>
				<meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
				<link rel="shortcut icon" href="/favicon.svg" />
			</Head>

			<Providers colorScheme={props.colorScheme}>
				{getLayout(<Component {...pageProps} />)}
			</Providers>
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
