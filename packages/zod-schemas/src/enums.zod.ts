import z from "zod";

export const API_PRODUCT_REQUEST_STATUS_ENUM = ["AI Error", "No active subscription", "Requests exhausted", "Pending", "Server Error", "Success"] as const;
export const apiProductRequestStatusZod = z.enum(API_PRODUCT_REQUEST_STATUS_ENUM);
export type ApiProductRequestStaus = z.infer<typeof apiProductRequestStatusZod>;

export const API_PRODUCTS = [
  {
    name: "Save Journal Entry",
    sku: "journal_entry_create",
    unit_size: 100
  }
]as const;
export const apiProductSkuEnum = API_PRODUCTS.map(product => product.sku) as ["journal_entry_create"];
export const apiProductSkuZod = z.enum(apiProductSkuEnum);
export type ApiProductSku = z.infer<typeof apiProductSkuZod>;

export const WEBHOOK_STATUS_ENUM = ["Pending", "Sent", "Failed"] as const;
export const webhookStatusZod = z.enum(WEBHOOK_STATUS_ENUM);
export type WebhookStatus = z.infer<typeof webhookStatusZod>;

export const API_REQUEST_METHOD_ENUM = ["GET", "POST", "PUT", "DELETE"] as const;
export const apiRequestMethodZod = z.enum(API_REQUEST_METHOD_ENUM);
export type ApiRequestMethod = z.infer<typeof apiRequestMethodZod>;