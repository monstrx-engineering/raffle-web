import { Card, Pagination, Table } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNowStrict } from 'date-fns';
import Link from 'next/link';
import { memo, useState } from 'react';
import {
	getWhitelistByRaffleId,
	queries,
	WhitelistResponse,
	WhitelistResponseError,
} from '~/src/services';

let ITEMS_PER_PAGE = 8;
let getPagination = (page: number) => ({
	from: (page - 1) * ITEMS_PER_PAGE,
	to: page * ITEMS_PER_PAGE - 1,
});
let getIndex = (page: number, i: number) => (page - 1) * ITEMS_PER_PAGE + (i + 1);

let get = <T extends any>(fn: () => T, fallback: T) => {
	try {
		return fn();
	} catch {
		return fallback;
	}
};

const Headers = memo(() => (
	<thead>
		<tr>
			<th>No.</th>
			<th>Wallet</th>
			<th style={{ textAlign: 'right' }}>When</th>
		</tr>
	</thead>
));

export function WhitelistTable({ raffleId }: { raffleId: string }) {
	let [page, setPage] = useState(1);

	let { data: whitelists } = useQuery<unknown, WhitelistResponseError, WhitelistResponse>({
		...queries.whitelists.byRaffleId(raffleId, getPagination(page)),
		queryFn: () => getWhitelistByRaffleId(raffleId, getPagination(page)),
		staleTime: 1000,
	});

	let totalItems = whitelists?.count;
	let totalPages = Math.floor((totalItems ?? 0) / ITEMS_PER_PAGE);

	if (!whitelists?.data?.length || !totalItems) return null;

	return (
		<>
			<Card mt={40} mb="md">
				<Table>
					<Headers />
					<tbody>
						{whitelists.data.map(({ address, created_at }, i) => (
							<tr key={i}>
								<td>{getIndex(page, i)}</td>
								<td style={{ fontFamily: 'monospace' }}>
									<Link href={`https://explorer.sui.io/address/${address}`}>{address}</Link>
								</td>
								<td style={{ textAlign: 'right' }}>
									{get(() => formatDistanceToNowStrict(new Date(created_at!)), '...')}
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
