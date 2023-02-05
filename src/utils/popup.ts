const HIDE_HUD = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,`;

interface Features {
	width: number;
	height: number;
}

export function center(url: URL | string, { width, height }: Features) {
	let left = window.screen.width / 2 - width / 2;
	let top = window.screen.height / 2 - height / 2;

	let options = Object.entries({ width, height, left, top })
		.map(([k, v]) => `${k}=${v}`)
		.join(',');

	return window.open(url, 'popup', HIDE_HUD + options);
}
