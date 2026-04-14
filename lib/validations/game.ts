import { z } from "zod";

export const gameSchema = z.object({
  title: z.preprocess((value) => String(value || "").trim(), z.string().min(1, "El título es requerido")),
  cover: z
    .preprocess((value) => {
      if (typeof value !== "string") return undefined;
      const trimmed = value.trim();
      return trimmed === "" ? undefined : trimmed;
    }, z.string().optional())
    .optional(),
  developer: z.preprocess((value) => String(value || "").trim(), z.string().min(1, "El desarrollador es requerido")),
  releaseDate: z.preprocess((value) => String(value || "").trim(), z.string().refine((dateString) => !Number.isNaN(Date.parse(dateString)), "Fecha inválida")),
  price: z.preprocess(
    (value) => {
      if (value == null) return NaN;
      return parseFloat(String(value));
    },
    z.number().finite({ message: "Precio inválido" }).nonnegative({ message: "Precio inválido" })
  ),
  genre: z.preprocess((value) => String(value || "").trim(), z.string().min(1, "El género es requerido")),
  description: z.preprocess((value) => String(value ?? "").trim(), z.string()),
  console_id: z.preprocess(
    (value) => {
      if (value == null) return NaN;
      return parseInt(String(value), 10);
    },
    z.number().int({ message: "Consola inválida" }).positive({ message: "Consola inválida" })
  ),
});

export type GameInput = z.infer<typeof gameSchema>;
