import { AppShell } from '@mantine/core';
import type { ReactNode } from 'react';

import { DefaultHeader } from './header';

export function Layout({ children }: { children: ReactNode }) {
	return (
		<AppShell
			styles={{
				main: {
					backgroundImage: 'url("/bg1.jpg")',
					backgroundSize: 'cover',
					backgroundPositionX: '87%',
				},
			}}
			header={<DefaultHeader />}
		>
			{children}
		</AppShell>
	);
}
