import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ooqrjthoboqpwyurgzmz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vcXJqdGhvYm9xcHd5dXJnem16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNDYzNzUsImV4cCI6MjA5NTcyMjM3NX0.klIpiLkcVmvRlUnNp7l8b0JYlzagEplSdfYzBsY1FHQ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);