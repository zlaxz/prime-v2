import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://esnfzdpevddzgckwidgf.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzbmZ6ZHBldmRkemdja3dpZGdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MDEzOTQsImV4cCI6MjA3NjM3NzM5NH0.kpQyk3I-aYe-8SBVJ1wdyPau_hIQAKaOK-kfJbCk4Sk";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
