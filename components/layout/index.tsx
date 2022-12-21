import { AppShell, useMantineTheme } from '@mantine/core';
import type { ReactNode } from 'react';

import { DefaultHeader } from './header';

export function Layout({ children }: { children: ReactNode }) {
	const theme = useMantineTheme();

	return (
		<AppShell
			styles={{
				main: {
					background: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
				},
			}}
			header={<DefaultHeader />}
		>
			{children}
		</AppShell>
	);
}
