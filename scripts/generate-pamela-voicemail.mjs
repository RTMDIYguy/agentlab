import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "sk_1e0a35b99d0ce169a76a72b5cfe1c5c3c6ae9f47e75ca881";
const VOICE_ID_PAMELA = process.env.ELEVENLABS_VOICE_ID_PAMELA || "JBFqnCBsd6RMkjVDRZzb";

const VOICEMAIL_SCRIPT = `Hi, you've reached Uncle Robert Consulting and Agent Lab. I'm Pamela, Robert's AI operations concierge. Whether you're calling about the 15-minute operational diagnostic, the founder signal framework, or migrating your business stack into Microsoft 365, please leave your name, company, and primary bottleneck after the tone. You can also book directly onto Robert's calendar anytime at agent-lab.tech. Have a wonderful day!`;

async function generateVoicemail() {
  console.log("Generating Pamela Google Voice Studio Greeting MP3 via ElevenLabs...");
  console.log(`Voice ID: ${VOICE_ID_PAMELA}`);

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID_PAMELA}?output_format=mp3_44100_128`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: VOICEMAIL_SCRIPT,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.55,
        similarity_boost: 0.85,
        style: 0.25,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`ElevenLabs TTS failed (${response.status}): ${err}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 1. Save in client/public/audio
  const publicAudioDir = path.resolve("client/public/audio");
  if (!fs.existsSync(publicAudioDir)) {
    fs.mkdirSync(publicAudioDir, { recursive: true });
  }
  const publicFile = path.join(publicAudioDir, "pamela-google-voice-greeting.mp3");
  fs.writeFileSync(publicFile, buffer);
  console.log(`✅ Saved public audio asset: ${publicFile} (${buffer.length} bytes)`);

  // 2. Save in root / artifacts folder for easy access
  const rootAudioFile = path.resolve("pamela-google-voice-greeting.mp3");
  fs.writeFileSync(rootAudioFile, buffer);
  console.log(`✅ Saved workspace root copy: ${rootAudioFile}`);

  // 3. Save to desktop/working docs directory
  const workingDocsAudio = path.resolve("../pamela-google-voice-greeting.mp3");
  try {
    fs.writeFileSync(workingDocsAudio, buffer);
    console.log(`✅ Saved working docs audio: ${workingDocsAudio}`);
  } catch (e) {
    console.log("Note: Could not write parent working docs copy.");
  }
}

generateVoicemail().catch(console.error);
