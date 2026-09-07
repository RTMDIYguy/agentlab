import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const apiKey = process.env.ELEVENLABS_API_KEY || "sk_1e0a35b99d0ce169a76a72b5cfe1c5c3c6ae9f47e75ca881";

async function listAllVoices() {
  const res = await fetch("https://api.elevenlabs.io/v1/voices", {
    headers: { "xi-api-key": apiKey },
  });

  const data = await res.json();
  console.log("=== ALL AVAILABLE ELEVENLABS VOICES ===");
  data.voices?.forEach(v => {
    console.log(`- ID: ${v.voice_id} | Name: ${v.name} | Category: ${v.category} | Gender: ${v.labels?.gender || "unknown"}`);
  });

  // Find Pamela or best female voice (e.g. Rachel, Sarah, Pamela)
  const pamela = data.voices?.find(v => v.name.toLowerCase().includes("pamela") || v.name.toLowerCase().includes("rachel") || v.labels?.gender === "female");
  const selectedVoiceId = pamela ? pamela.voice_id : "21m00Tcm4TlvDq8ikWAM"; // Rachel fallback or found voice
  const selectedVoiceName = pamela ? pamela.name : "Default";

  console.log(`\nSynthesizing with: ${selectedVoiceName} (${selectedVoiceId})...`);

  const greetingText = "Hi, you've reached Uncle Robert Consulting and Agent Lab. I'm Pamela, Robert's AI operations concierge. Whether you're calling about the 15-minute operational diagnostic, the founder signal framework, or migrating your business stack into Microsoft 365, please leave your name, company, and primary bottleneck after the tone. You can also book directly onto Robert's calendar anytime at agent-lab.tech. Have a wonderful day!";

  const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: greetingText,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.8,
      },
    }),
  });

  if (!ttsRes.ok) {
    console.error("TTS Error:", ttsRes.status, await ttsRes.text());
    return;
  }

  const arrayBuffer = await ttsRes.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  console.log(`Generated audio buffer: ${buffer.length} bytes`);

  // Write to all locations
  fs.writeFileSync("pamela-google-voice-greeting.mp3", buffer);
  fs.writeFileSync("client/public/audio/pamela-google-voice-greeting.mp3", buffer);
  fs.writeFileSync("../pamela-google-voice-greeting.mp3", buffer);
  console.log("✅ Successfully generated and replaced pamela-google-voice-greeting.mp3 across all folders!");
}

listAllVoices().catch(console.error);
