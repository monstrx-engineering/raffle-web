import { NotificationProps, showNotification } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons';

export type Args = Partial<NotificationProps> & Pick<NotificationProps, 'message'>;

export const success = (args: Args) =>
	showNotification({
		title: 'Success',
		color: 'green',
		icon: <IconCheck />,
		...args,
	});

export const error = (args: Args) =>
	showNotification({
		title: 'Error',
		color: 'red',
		icon: <IconX />,
		...args,
	});
