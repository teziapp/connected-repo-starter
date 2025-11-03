import z from "zod";

export const API_REQUEST_STATUS_ENUM = ["AI Error", "Pending", "Server Error", "Success"] as const;
export const apiRequestStatusZod = z.enum(API_REQUEST_STATUS_ENUM);
export type ApiRequestStaus = z.infer<typeof apiRequestStatusZod>;