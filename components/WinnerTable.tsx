import { Card, Table } from '@mantine/core';
import React from 'react';

export function WinnerTable({ winners }: { winners: string[] }) {
	return (
		<Card>
			<Table>
				<thead>
					<tr>
						<th>No.</th>
						<th style={{ textAlign: 'right' }}>Discord</th>
					</tr>
				</thead>
				<tbody>
					{winners.map((account, i) => (
						<tr key={account}>
							<td>{i + 1}</td>
							<td style={{ textAlign: 'right' }}>{account}</td>
						</tr>
					))}
				</tbody>
			</Table>
		</Card>
	);
}
