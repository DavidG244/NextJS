import { z } from "zod";

export const consoleSchema = z.object({
  name: z.preprocess((value) => String(value || "").trim(), z.string().min(1, "El nombre es requerido")),
  manufacturer: z.preprocess((value) => String(value || "").trim(), z.string().min(1, "El fabricante es requerido")),
  releaseDate: z.preprocess(
    (value) => String(value || "").trim(),
    z.string().refine((dateString) => !Number.isNaN(Date.parse(dateString)), "Fecha inválida")
  ),
  description: z.preprocess((value) => String(value ?? "").trim(), z.string().min(1, "La descripción es requerida")),
});

export type ConsoleInput = z.infer<typeof consoleSchema>;
