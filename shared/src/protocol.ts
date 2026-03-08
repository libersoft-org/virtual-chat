const errorCodes = [
	'INVALID_JSON',
	'INVALID_COMMAND',
	'UNKNOWN_METHOD',
	'ALREADY_IN_ROOM',
	'MISSING_NAME',
	'WRONG_NAME',
	'MISSING_SEX',
	'WRONG_SEX',
	'MISSING_COLOR',
	'WRONG_COLOR',
	'NOT_IN_ROOM',
	'INVALID_COORDS',
	'WRONG_COORDS',
	'WRONG_ANGLE',
	'MISSING_MESSAGE',
	'EMPTY_MESSAGE',
	'RATE_LIMITED',
	'WRONG_EXPRESSION',
] as const;

export type ErrorCode = (typeof errorCodes)[number];

export const ErrorCode: { readonly [K in ErrorCode]: K } = Object.fromEntries(
	errorCodes.map(c => [c, c]),
) as { readonly [K in ErrorCode]: K };

export interface UserData {
	name: string;
	color: number;
	sex: boolean;
	x: number;
	z: number;
	angle: number;
	expression: number;
}

export interface EnterData extends UserData {
	uuid: string;
}

export interface LeaveData {
	uuid: string;
}

export interface MoveData {
	user: string;
	x: number;
	z: number;
	angle: number;
}

export interface MessageData {
	user: string;
	name: string;
	message: string;
}

export interface UsersEntry {
	uuid: string;
	user: UserData;
}

export interface ExpressionData {
	user: string;
	expression: number;
}

export interface ServerMessage<T = unknown> {
	method?: string;
	error?: ErrorCode;
	data?: T;
}
