import { Card, Pagination, Table } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNowStrict } from 'date-fns';
import Link from 'next/link';
import React, { useState } from 'react';
import {
	getWhitelistByRaffleId,
	queries,
	WhitelistResponse,
	WhitelistResponseError,
} from '~/src/services';

const ITEMS_PER_PAGE = 8;
const getPagination = (page: number) => ({
	from: (page - 1) * ITEMS_PER_PAGE,
	to: page * ITEMS_PER_PAGE - 1,
});
const TABLE_PLACEHOLDER = Array(ITEMS_PER_PAGE).fill({
	address: '...',
	created_at: '...',
}) as NonNullable<WhitelistResponse['data']>;

export function WhitelistTable({ raffleId }: { raffleId: string }) {
	let [page, setPage] = useState(1);

	let { data: whitelists } = useQuery<unknown, WhitelistResponseError, WhitelistResponse>({
		...queries.whitelists.byRaffleId(raffleId, getPagination(page)),
		queryFn: () => getWhitelistByRaffleId(raffleId, getPagination(page)),
		staleTime: 2 * 60 * 60,
	});

	let totalItems = whitelists?.count;
	let totalPages = Math.floor((totalItems ?? 0) / ITEMS_PER_PAGE);

	return (
		<>
			<Card mt={40} mb="md">
				<Table>
					<thead>
						<tr>
							<th>No.</th>
							<th>Wallet</th>
							<th style={{ textAlign: 'right' }}>When</th>
						</tr>
					</thead>
					<tbody>
						{(whitelists?.data ?? TABLE_PLACEHOLDER).map(({ address, created_at }, i) => (
							<tr key={i}>
								<td>{(page - 1) * ITEMS_PER_PAGE + (i + 1)}</td>
								<td style={{ fontFamily: 'monospace' }}>
									<Link href={`https://explorer.sui.io/address/${address}`}>{address}</Link>
								</td>
								<td style={{ textAlign: 'right' }}>
									{function () {
										try {
											return formatDistanceToNowStrict(new Date(created_at));
										} catch {
											return '...';
										}
									}.call(null)}
								</td>
							</tr>
						))}
					</tbody>
				</Table>
			</Card>
			<Pagination total={totalPages} onChange={setPage} />
		</>
	);
}
