import * as z from 'zod';

// Load .env if present (built into Node 20.12+, no dotenv needed).
try {
  process.loadEnvFile();
} catch {
  // No .env file — fine, rely on real environment variables.
}

const ConfigSchema = z.object({
  SAP_API_KEY: z.string().min(1, 'SAP_API_KEY is required — see .env.example'),
  SAP_BASE_URL: z
    .string()
    .url()
    .default('https://sandbox.api.sap.com/s4hanacloud/sap/opu/odata/sap'),
  SAP_MAX_ROWS: z.coerce.number().int().positive().max(500).default(50),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = ConfigSchema.safeParse(env);
  if (!parsed.success) {
    // stderr only — stdout is reserved for MCP protocol messages!
    console.error('Invalid configuration:\n' + z.prettifyError(parsed.error));
    process.exit(1);
  }
  return parsed.data;
}
