import type { BetterAuthOptions } from "@better-auth/core";
import type {
	DBAdapter,
	DBAdapterDebugLogOption
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
  debugLogs: true,
  usePlural: false,
}) => {
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
			// transaction: orchidDBTransactionAdapter,
			disableIdGeneration: true,
    },
  };
  const adapter = createAdapterFactory(adapterOptions);
  return (options: BetterAuthOptions): DBAdapter<BetterAuthOptions> => {
    return adapter(options);
  };
};