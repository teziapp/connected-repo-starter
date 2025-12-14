
import type {
  DBTransactionAdapter
} from "@better-auth/core/db/adapter";
import type { BetterAuthOptions } from "better-auth";

export const orchidDBTransactionAdapter = async () => (async (trx: DBTransactionAdapter<BetterAuthOptions>) => {
	return null;
});