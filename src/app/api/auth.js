import { supabase } from "../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { email, password, provider } = req.body;

    if (provider === "google") {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json({ data });
    }

    const { user, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ user });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
