import { Db, db as orchidDb } from "@backend/db/db";
import z from "zod";

export const modelNames = ["accounts", "sessions", "users", "verifications"] as const;
export type ModelName = typeof modelNames[number];

export const validateModel = (model: string) => z.enum(modelNames).parse(model);
export const validateSelect = <T extends ModelName>(
  modelName: T, 
  select: string[] | undefined
): (Db[T]["columns"])[] | ["*"] => {
  if(!select) return ["*"] as const;

    // @ts-expect-error
  return z.array(z.enum(orchidDb[modelName].columns)).parse(select)
};