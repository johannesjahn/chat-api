export const jwtConstants = {
	getSecret: () => {
		return process.env.JWT_SECRET!;
	},
};
export const hashConstants = {
	saltRounds: 10,
	salt: () => process.env.SALT!,
};
