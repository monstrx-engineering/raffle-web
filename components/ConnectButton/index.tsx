/* eslint-disable prefer-const */
import { ButtonProps } from "@mantine/core";
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

export function SelectWalletButton(props: ButtonProps) {
	const [showModal, setShowModal] = useState(false);

	return (
		<ConnectModal open={showModal} onOpenChange={(open: boolean) => setShowModal(open)}>
			<Button
				// eslint-disable-next-line react/no-children-prop
				children="Connect Wallet"
				{...props}
				onClick={() => setShowModal(true)}
			/>
		</ConnectModal>
	);
}

export function ConnectButton() {
	const wallet = useWallet();
	return wallet.connected ? <WalletAddress /> : <SelectWalletButton />;
}
