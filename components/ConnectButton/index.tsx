/* eslint-disable prefer-const */
import { Button, Menu } from "@mantine/core";
import { ConnectModal, useWallet } from "@suiet/wallet-kit";
import { useState } from "react";

let truncate = (words: string) => {
	const front = words.substring(0, 6);
	const back = words.substring(words.length - 4);
	return `${front}...${back}`;
};

export function WalletAddress() {
	const wallet = useWallet();
	return (
		<Menu shadow="md" width={200}>
			<Menu.Target>
				<Button>{truncate(wallet.address!)}</Button>
			</Menu.Target>

			<Menu.Dropdown>
				<Menu.Item onClick={wallet.disconnect}>Disconnect</Menu.Item>
			</Menu.Dropdown>
		</Menu>
	);
}

export function SelectWalletButton() {
	const [showModal, setShowModal] = useState(false);

	return (
		<ConnectModal open={showModal} onOpenChange={(open) => setShowModal(open)}>
			<Button onClick={() => setShowModal(true)}>Connect Wallet</Button>
		</ConnectModal>
	);
}

export function ConnectButton() {
	const wallet = useWallet();
	return wallet.connected ? <WalletAddress /> : <SelectWalletButton />;
}
