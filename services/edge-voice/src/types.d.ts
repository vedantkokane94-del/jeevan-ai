export interface Env {
  // Cloudflare Workers AI Binding
  AI: any;

  // Supabase
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;

  // Sarvam AI
  SARVAM_API_KEY: string;
}
