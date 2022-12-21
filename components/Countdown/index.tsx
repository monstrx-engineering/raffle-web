/* eslint-disable prefer-const */
import { Card, Group, Stack, Text } from '@mantine/core';
import ReactCountdown from 'count-down-react';

let Counter = ({ label, value }: { label: string; value: string }) => (
	<Card px={8} py={12} bg="dark" style={{ color: 'white' }}>
		<Stack spacing={0} align="center">
			<Text fz={24}>{value}</Text>
			<Text fz="xs">{label}</Text>
		</Stack>
	</Card>
);

const CoundownRenderer = ({ days, hours, minutes, seconds }) => (
	<Group grow>
		<Counter label="days" value={days} />
		<Counter label="hrs" value={hours} />
		<Counter label="mins" value={minutes} />
		<Counter label="secs" value={seconds} />
	</Group>
);
export function Countdown({
	date,
}: {
	date: React.ComponentPropsWithoutRef<typeof ReactCountdown>['date'];
}) {
	return <ReactCountdown date={date} renderer={CoundownRenderer} />;
}
