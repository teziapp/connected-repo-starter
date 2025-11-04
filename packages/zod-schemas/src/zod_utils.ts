import { z } from "zod";

/* Integer Types */
export const zSmallint = (min = -32768, max = 32767) => z.int().min(min).max(max);
export const zInteger = (min = -2147483648, max = 2147483647) => z.int32().min(min).max(max);
export const zBigint = (min = -9223372036854775808n, max = 9223372036854775807n) =>
  z.bigint().min(min).max(max);

export const zTimeEpoch = z.coerce.number().int().min(0);

export const zDecimal = (precision: number, scale: number, min?: number, max?: number) => {
	let schema = z.coerce.number().refine(
		(val) => {
			const numStr = Math.abs(val).toString();
			const [integerPart = "", decimalPart = ""] = numStr.split(".");

			// NOTE:  Precision validation incorrect: counting digits from toString() fails for scientific notation (e.g., 1e10) and doesn't handle leading zeros properly
			// Check precision (total significant digits including both integer and decimal parts)
			if (integerPart.length + decimalPart.length > precision) {
				return false;
			}

			// Check scale (digits after decimal point)
			if (decimalPart.length > scale) {
				return false;
			}

			return true;
		},
		{
			message: `Number must have at most ${precision} total significant digits and ${scale} digits after decimal point`,
		},
	);

	// Add min value check if specified
	if (min !== undefined) {
		schema = schema.refine((val) => val >= min, {
			message: `Value must be greater than or equal to ${min}`,
		});
	}

	// Add max value check if specified
	if (max !== undefined) {
		schema = schema.refine((val) => val <= max, {
			message: `Value must be less than or equal to ${max}`,
		});
	}

	return schema.transform((num) => num.toString());
};

/* Common Types */

export const zString = z.string().trim();

export const zVarchar = (minLength = 0, maxLength = 255) => zString.min(minLength).max(maxLength);

export const zText = (minLength = 0) => zString.min(minLength);

export const zTimestamps = {
	createdAt: zTimeEpoch,
	updatedAt: zTimeEpoch,
};

export const zPrice = zDecimal(10, 2, 0.01);
export const zQuantity = zDecimal(11, 3, 0.001);
export const zAmount = (min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY) => zDecimal(15, 2, min, max);

/* Compliance Doc Types */
export const zGSTIN = zString
	.toUpperCase()
	.length(15)
	.regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GSTIN format")
	.refine((gstin: string) => {
		const GSTIN_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		const chars = gstin.slice(0, 14);
		const len = GSTIN_CHARS.length;

		const total = chars.split("").reduce((acc, char, i) => {
			const codePoint = GSTIN_CHARS.indexOf(char);
			const weight = i % 2 === 0 ? 1 : 2;
			const product = codePoint * weight;
			return acc + Math.floor(product / len) + (product % len);
		}, 0);

		const checksumCodePoint = (len - (total % len)) % len;
		return gstin[14] === GSTIN_CHARS[checksumCodePoint];
	}, "Invalid GSTIN checksum");

export const zPAN = zString
	.toUpperCase()
	.length(10)
	.regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/);

export const zUdyogAadhaar = zString
	.toUpperCase()
	.length(12)
	.regex(/^[2-9]{1}[0-9]{3}\s[0-9]{4}\s[0-9]{4}$/);

export const zUdyamRegistrationNumber = zString
	.toUpperCase()
	.length(19)
	.regex(/^UDYAM-[A-Z]{2}-[0]{2}-\d{7}$/);

/* Contact Types */
export const zPhoneNumber = z
	.string()
	.trim()
	.min(10, "Phone number must be at least 10 digits")
	.max(15, "Phone number must be at most 15 digits")
	.regex(/^[+]?[1-9][\d\s\-\(\)]{8,14}$/, "Invalid phone number format");

/* Location Types */
// https://stackoverflow.com/questions/3518504/regular-expression-for-matching-latitude-longitude-coordinates/31408260#31408260
export const zLatitude = zString.regex(/^(\+|-)?(?:90(?:(?:\.0{1,6})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,6})?))$/);
export const zLongitude = zString
	.regex(/^(\+|-)?(?:180(?:(?:\.0{1,6})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,6})?))$/);
