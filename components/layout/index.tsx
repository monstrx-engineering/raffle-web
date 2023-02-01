import { AppShell } from '@mantine/core';
import type { ReactNode } from 'react';

import { DefaultHeader } from './header';

export function Layout({ children }: { children: ReactNode }) {
	return (
		<AppShell
			styles={{
				main: {
					backgroundSize: 'cover',
					backgroundPositionX: '87%',

					'html.avif &': { backgroundImage: `url('/bg.avif')` },
					'html.fallback &': { backgroundImage: `url('/bg.jpg')` },
				},
			}}
			header={<DefaultHeader />}
		>
			{children}
		</AppShell>
	);
}
