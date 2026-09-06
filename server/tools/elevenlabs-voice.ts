/**
 * ElevenLabs Voice & Speech Tool
 * 
 * Provides direct Text-to-Speech (TTS), Conversational AI agent orchestration,
 * and voice synthesis for inbound/outbound call workflows (Pamela & AgentLab).
 */

export interface VoiceSynthesisOptions {
  text: string;
  voiceId?: string;
  modelId?: string;
  outputFormat?: string;
}

export interface VoiceCallPayload {
  callerNumber?: string;
  recipientNumber: string;
  agentPrompt?: string;
  workflowId?: string;
  leadContext?: {
    name?: string;
    company?: string;
    campaign?: "CRE" | "MedSpa" | "FounderSignal" | "General";
  };
}

const DEFAULT_PAMELA_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb";
const DEFAULT_MODEL_ID = "eleven_multilingual_v2";
const DEFAULT_OUTPUT_FORMAT = "mp3_44100_128";

/**
 * Generate speech audio stream/buffer from text using ElevenLabs REST API
 */
export async function convertTextToSpeech(options: VoiceSynthesisOptions): Promise<{
  audioBuffer: Buffer;
  contentType: string;
  voiceId: string;
}> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is not configured in environment.");
  }

  const voiceId = options.voiceId || process.env.ELEVENLABS_VOICE_ID_PAMELA || DEFAULT_PAMELA_VOICE_ID;
  const modelId = options.modelId || DEFAULT_MODEL_ID;
  const outputFormat = options.outputFormat || DEFAULT_OUTPUT_FORMAT;

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=${outputFormat}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: options.text,
      model_id: modelId,
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.8,
        style: 0.2,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs TTS Error (${response.status}): ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return {
    audioBuffer: Buffer.from(arrayBuffer),
    contentType: "audio/mpeg",
    voiceId,
  };
}

/**
 * Synthesize Pamela Outbound Prompt for Campaign Leads
 */
export function buildPamelaOutboundScript(context: {
  leadName?: string;
  companyName?: string;
  campaignType: "CRE" | "MedSpa" | "FounderSignal";
}): string {
  const name = context.leadName || "there";
  const company = context.companyName ? `at ${context.companyName}` : "";

  switch (context.campaignType) {
    case "CRE":
      return `Hi ${name}, this is Pamela with the Uncle Robert Consulting Commercial Real Estate Practice ${company}. I'm following up on the AI Expansion Radar assessment you requested for multi-tenant retail and industrial occupancy. Would you like to lock in your 15-minute diagnostic review with Robert this week?`;
    case "MedSpa":
      return `Hello ${name}, this is Pamela calling from Uncle Robert Consulting ${company}. We noticed your inquiry regarding our 3-second patient intake and HIPAA-compliant AI booking assistant for aesthetics practices. I have two openings available for a live practice workflow walkthrough.`;
    case "FounderSignal":
    default:
      return `Hi ${name}, Pamela here from AgentLab and Bootstrapper Capital. Following up on your Founder Signal System sprint booking. We're getting the 5-day agent swarm scheduled for you.`;
  }
}
