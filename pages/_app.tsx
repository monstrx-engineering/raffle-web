import { useState } from "react";
import NextApp, { AppProps, AppContext } from "next/app";
import { getCookie, setCookie } from "cookies-next";
import Head from "next/head";

import { MantineProvider, ColorScheme, ColorSchemeProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import { useColorScheme } from "@mantine/hooks";

import { WalletProvider } from "@suiet/wallet-kit";
import "@suiet/wallet-kit/style.css";
import "../components/ConnectButton/suiet-wallet-kit-custom.css";

export default function App(props: AppProps & { colorScheme: ColorScheme }) {
	const { Component, pageProps } = props;
	const preferredColorScheme = useColorScheme("dark", { getInitialValueInEffect: false });
	const [colorScheme, setColorScheme] = useState<ColorScheme>(
		props.colorScheme ?? preferredColorScheme
	);

	const toggleColorScheme = (value?: ColorScheme) => {
		const nextColorScheme = value || (colorScheme === "dark" ? "light" : "dark");
		setColorScheme(nextColorScheme);
		setCookie("mantine-color-scheme", nextColorScheme, {
			maxAge: 60 * 60 * 24 * 30,
		});
	};

	console.log({ preferredColorScheme, saved: props.colorScheme, colorScheme });

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
						<WalletProvider>
							<Component {...pageProps} />
						</WalletProvider>
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
		colorScheme: getCookie("mantine-color-scheme", appContext.ctx),
	};
};
