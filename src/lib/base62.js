let charset = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_';

export function encode (n) {
	if (n === 0) return '0';

	let res = '';
	while (n > 0) {
		res = charset[n % 64] + res;
		n = ~~(n / 64);
	}

	return res;
}
