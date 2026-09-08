import type { Request, Response } from "express";
import { getDb } from "../db";
import { workflowArtifacts } from "../schema";
import { eq, and } from "drizzle-orm";

interface GenerateImagePayload {
  prompt: string;
  title?: string;
  aspectRatio?: "16:9" | "1:1" | "4:5" | "9:16";
  stylePreset?: string;
  styleNotes?: string;
  artifactId?: string;
}

/**
 * Maps aspect ratio string to width/height dimensions
 */
function getDimensionsForRatio(ratio: string = "16:9"): { width: number; height: number; imagenRatio: string } {
  switch (ratio) {
    case "1:1":
      return { width: 1024, height: 1024, imagenRatio: "1:1" };
    case "4:5":
      return { width: 896, height: 1120, imagenRatio: "3:4" };
    case "9:16":
      return { width: 720, height: 1280, imagenRatio: "9:16" };
    case "16:9":
    default:
      return { width: 1280, height: 720, imagenRatio: "16:9" };
  }
}

/**
 * Cleans and converts raw prompt text / markdown into a clean visual prompt for AI image generation.
 */
function cleanPromptForDiffusion(rawPrompt: string, stylePreset?: string, styleNotes?: string): string {
  let cleaned = rawPrompt
    // Strip markdown code blocks, headers, bullet points
    .replace(/```[\s\S]*?```/g, "")
    .replace(/#+\s+/g, "")
    .replace(/\*\*/g, "")
    .replace(/Prompt Template:?/gi, "")
    .replace(/Target Platform:?/gi, "")
    .replace(/Aspect Ratio:?/gi, "")
    .replace(/Art Direction Notes:?/gi, "")
    .replace(/Brand Palette:?/gi, "")
    .replace(/#0F172A/gi, "deep navy blue")
    .replace(/#3B82F6/gi, "electric sapphire blue")
    .replace(/#10B981/gi, "vibrant emerald green")
    .replace(/\s+/g, " ")
    .trim();

  // If prompt is too abstract (e.g. "SOP adherence, OKR progress"), ground it with concrete visual subjects
  if (cleaned.length < 20 || cleaned.toLowerCase().includes("undefined")) {
    cleaned = "Futuristic holographic agency operations command center, founder looking at glowing 3D data streams, deep navy background with sapphire and emerald lighting.";
  }

  // Append aesthetic enhancements
  const presetEnhancements: Record<string, string> = {
    "Modern B2B Isometric": "3D isometric illustration, sleek UI cards, volumetric lighting, high contrast B2B SaaS aesthetic, octane render 8k",
    "Dark Glassmorphism": "Dark glassmorphic dashboard interface, glowing translucent widgets, neon reflections, high-tech corporate aesthetic, 8k resolution",
    "Founder / Executive": "Professional executive portrait in modern architectural tech office, warm cinematic rim lighting, 35mm photography, shallow depth of field",
    "Minimalist Vector": "Clean high-contrast vector editorial illustration, modern Swiss typography layout, bold shapes, minimal corporate aesthetic",
  };

  const extraStyle = stylePreset && presetEnhancements[stylePreset] 
    ? presetEnhancements[stylePreset] 
    : "Modern 3D isometric tech illustration, clean corporate B2B aesthetic, navy background, sapphire blue and emerald lighting, highly detailed 8k";

  return `${cleaned}, ${extraStyle}`;
}

/**
 * Attempt to generate an image using Google Imagen 3 on Vertex / Gemini API
 */
async function generateWithImagen3(
  prompt: string,
  aspectRatio: string,
  apiKey: string
): Promise<{ imageUrl: string; engine: string } | null> {
  try {
    const { imagenRatio } = getDimensionsForRatio(aspectRatio);
    const cleanKey = apiKey.trim().replace(/^["']|["']$/g, "");
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${cleanKey}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        instances: [{ prompt: prompt.slice(0, 480) }],
        parameters: {
          sampleCount: 1,
          aspectRatio: imagenRatio,
          outputMimeType: "image/jpeg",
        },
      }),
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[Imagen 3 Warning] Status ${res.status}: ${errText.slice(0, 200)}`);
      return null;
    }

    const data: any = await res.json();
    const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
    if (b64) {
      return {
        imageUrl: `data:image/jpeg;base64,${b64}`,
        engine: "Google Imagen 3 (imagen-3.0-generate-002)",
      };
    }
  } catch (err: any) {
    console.warn("[Imagen 3 Error]:", err.message);
  }
  return null;
}

/**
 * Resilient multi-engine fallback with server-side buffer verification and base64 conversion
 */
async function generateWithServerSideFlux(
  prompt: string,
  aspectRatio: string
): Promise<{ imageUrl: string; engine: string }> {
  const { width, height } = getDimensionsForRatio(aspectRatio);
  const seed = Math.floor(Math.random() * 1000000);
  const encodedPrompt = encodeURIComponent(prompt.slice(0, 300));
  const directUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const imgRes = await fetch(directUrl, {
      headers: { "User-Agent": "AgentLab/1.0" },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (imgRes.ok) {
      const arrayBuffer = await imgRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      if (buffer.length > 5000) {
        const base64 = buffer.toString("base64");
        const contentType = imgRes.headers.get("content-type") || "image/jpeg";
        return {
          imageUrl: `data:${contentType};base64,${base64}`,
          engine: "Flux Schnell (Verified Neural Render)",
        };
      }
    }
  } catch (err: any) {
    console.warn("[Server-Side Flux Buffer Note]:", err.message);
  }

  // Fallback directly to direct URL if buffer fetch timed out
  return {
    imageUrl: directUrl,
    engine: "Flux Schnell (Neural Render)",
  };
}

/**
 * Controller to handle AI graphic generation requests from Command Center and Pulse Social
 */
export async function handleGenerateImage(req: Request, res: Response): Promise<void> {
  try {
    const workspaceId = req.workspaceId;
    if (!workspaceId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const {
      prompt,
      title = "AI Generated Visual Asset",
      aspectRatio = "16:9",
      stylePreset,
      styleNotes,
      artifactId,
    }: GenerateImagePayload = req.body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      res.status(400).json({ error: "Prompt is required for image generation" });
      return;
    }

    const cleanedPrompt = cleanPromptForDiffusion(prompt, stylePreset, styleNotes);
    console.log(`[IMAGE GENERATOR] Generating (${aspectRatio}): "${cleanedPrompt.slice(0, 100)}..."`);

    let result: { imageUrl: string; engine: string } | null = null;
    const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    // 1. Try Google Imagen 3 if key is configured
    if (geminiKey) {
      result = await generateWithImagen3(cleanedPrompt, aspectRatio, geminiKey);
    }

    // 2. Fall back to Server-Side Verified Flux render
    if (!result) {
      result = await generateWithServerSideFlux(cleanedPrompt, aspectRatio);
    }

    // 3. Persist image metadata to artifact if artifactId was provided
    if (artifactId) {
      const db = await getDb();
      if (db) {
        const existing = await db
          .select()
          .from(workflowArtifacts)
          .where(and(eq(workflowArtifacts.id, artifactId), eq(workflowArtifacts.workspaceId, workspaceId)))
          .limit(1);

        if (existing.length > 0) {
          const currentMeta = (existing[0].metadata as Record<string, any>) || {};
          const updatedMeta = {
            ...currentMeta,
            imageUrl: result.imageUrl,
            imageEngine: result.engine,
            aspectRatio,
            generatedAt: new Date().toISOString(),
          };

          await db
            .update(workflowArtifacts)
            .set({
              metadata: updatedMeta,
              updatedAt: new Date(),
            })
            .where(eq(workflowArtifacts.id, artifactId));
        }
      }
    }

    res.status(200).json({
      success: true,
      title,
      imageUrl: result.imageUrl,
      engine: result.engine,
      aspectRatio,
      prompt: cleanedPrompt,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Image Generation Error]:", error);
    res.status(500).json({ error: error.message || "Failed to generate visual graphic" });
  }
}
