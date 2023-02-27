let charset = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_';

export function encode (n: number) {
	if (n === 0) {
		return '0';
	}

	let str = '';
	while (n > 0) {
		str = charset[n % 64] + str;
		n = ~~(n / 64);
	}

	return str;
}
