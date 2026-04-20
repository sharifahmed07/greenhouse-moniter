import { z } from "zod";

export const ingestSchema = z.object({
  deviceId: z.string().trim().min(1).max(120),
  location: z.string().trim().min(1).max(120),
  temperature: z.number().finite().min(-40).max(80),
  humidity: z.number().finite().min(0).max(100),
  timestamp: z.string().datetime(),
});

export type IngestPayload = z.infer<typeof ingestSchema>;
