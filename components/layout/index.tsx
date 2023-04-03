import { AppShell, Center } from '@mantine/core';
import type { ReactNode } from 'react';

import { DefaultHeader } from './header';
import { DefaultFooter } from './footer';

export function Layout({ children }: { children: ReactNode }) {
	return (
		<AppShell
			styles={{
				main: {
					backgroundColor: '#151514',
					// backgroundSize: 'cover',
					// backgroundPositionX: '87%',
					// 'html.avif &': { backgroundImage: `url('/bg.avif')` },
					// 'html.fallback &': { backgroundImage: `url('/bg.jpg')` },
				},
			}}
			header={<DefaultHeader />}
			footer={<DefaultFooter />}
		>
			<Center py={8} bg="#e6effe" c="dark" fw="bold" td="underline">
				Announcement: wallet signing feature under maintenance
			</Center>
			{children}
		</AppShell>
	);
}
