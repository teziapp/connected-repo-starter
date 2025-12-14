import type { BetterAuthOptions } from "@better-auth/core";
import type {
	DBAdapter,
	DBAdapterDebugLogOption,
	DBTransactionAdapter
} from "@better-auth/core/db/adapter";
import { createAdapterFactory } from "@better-auth/core/db/adapter";
import { createCustomAdapterOrchid } from "./custom_adapter.orchid_adapter";

interface OrchidAdapterConfig {
  /**
   * Helps you debug issues with the adapter.
   */
  debugLogs?: DBAdapterDebugLogOption;
  /**
   * If the table names in the schema are plural.
   */
  usePlural?: boolean;
}

export const orchidAdapter = (db: { [key: string]: any }, config: OrchidAdapterConfig = {
  debugLogs: false,
  usePlural: false,
}) => {
	let lazyOptions: BetterAuthOptions | null = null;
  const adapterOptions = {
    adapter: createCustomAdapterOrchid(db),
    config: {
      adapterId: "orchid",
      adapterName: "Orchid ORM Adapter",
      usePlural: config.usePlural,
      debugLogs: config.debugLogs,
			supportsUUIDs: true,
			supportsJSON: true,
			supportsArrays: true,
			transaction: false as false | (<R>(cb: (trx: DBTransactionAdapter<BetterAuthOptions>) => Promise<R>) => Promise<R>),
			disableIdGeneration: true,
    },
  };

	adapterOptions.config.transaction = (cb) => db.$transaction(() => {
		const adapter = createAdapterFactory({
			config: adapterOptions.config,
			adapter: createCustomAdapterOrchid(db),
		})(lazyOptions!);
		return cb(adapter);
	});

  const adapter = createAdapterFactory(adapterOptions);
  return (options: BetterAuthOptions): DBAdapter<BetterAuthOptions> => {
		lazyOptions = options;
    return adapter(options);
  };
};