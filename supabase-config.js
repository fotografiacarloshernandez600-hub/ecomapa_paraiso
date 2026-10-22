// Configuración pública del cliente web. Usa SOLO la clave anon/publishable de Supabase.
// Nunca pegues la service_role key aquí ni la incluyas en la APK.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const SUPABASE_URL = "https://rmfernuqynhdqsuumqmm.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Lzy-xrbQ4XO-phn0VeehmA_ogQI_lDu";
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
