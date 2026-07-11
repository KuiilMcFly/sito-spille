import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf8");
const env = {};
envContent.split("\n").forEach((line) => {
  const idx = line.indexOf("=");
  if (idx > 0) {
    env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SECRET_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const admins = [
  { email: "walice345@gmail.com", password: "Anya23!", name: "Valeria Admin" },
  { email: "carmine.esp40@gmail.com", password: "Batman64$", name: "Carmine Admin" },
];

for (const admin of admins) {
  const { data: existing } = await supabase.auth.admin.listUsers();
  const found = existing?.users?.find((u) => u.email === admin.email);

  let userId = found?.id;

  if (!found) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: admin.email,
      password: admin.password,
      email_confirm: true,
      user_metadata: { full_name: admin.name },
    });
    if (error) {
      console.error("Errore creazione " + admin.email + ":", error.message);
      continue;
    }
    userId = data.user.id;
    console.log("Creato utente:", admin.email);
  } else {
    await supabase.auth.admin.updateUserById(found.id, {
      password: admin.password,
      email_confirm: true,
    });
    console.log("Aggiornato utente esistente:", admin.email);
  }

  if (userId) {
    const { error: profileError } = await supabase.from("admin_profiles").upsert({
      id: userId,
      full_name: admin.name,
      role: "admin",
    });
    if (profileError) {
      console.error("Errore profilo admin:", profileError.message);
    } else {
      console.log("Profilo admin OK:", admin.email);
    }
  }
}

console.log("Fatto.");
