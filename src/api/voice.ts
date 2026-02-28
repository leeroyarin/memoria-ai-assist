import { supabase } from "@/integrations/supabase/client";

export async function getScribeToken(): Promise<string> {
  const { data, error } = await supabase.functions.invoke("elevenlabs-scribe-token");
  if (error || !data?.token) throw new Error(error?.message || "Failed to get STT token");
  return data.token;
}

export async function textToSpeech(text: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;
  if (!accessToken) throw new Error("Not authenticated");

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ text, voiceId: "EXAVITQu4vr4xnSDxMaL" }), // Sarah voice
    }
  );
  if (!response.ok) throw new Error(`TTS failed: ${response.status}`);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  await audio.play();
}
