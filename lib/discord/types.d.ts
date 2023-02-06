export interface Application {
	id: string;
	name: string;
	icon: string;
	description: string;
	hook: boolean;
	bot_public: boolean;
	bot_require_code_grant: boolean;
	verify_key: string;
}

export interface User {
	id: string;
	username: string;
	avatar: string;
	discriminator: string;
	public_flags: number;
}

export interface ApiMetadata {
	application: Application;
	scopes: string[];
	expires: Date;
}
