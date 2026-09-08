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
      return { width: 1024, height: 1280, imagenRatio: "3:4" };
    case "9:16":
      return { width: 720, height: 1280, imagenRatio: "9:16" };
    case "16:9":
    default:
      return { width: 1280, height: 720, imagenRatio: "16:9" };
  }
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

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: imagenRatio,
          outputMimeType: "image/jpeg",
        },
      }),
    });

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
 * Resilient multi-engine fallback (Flux Schnell)
 */
async function generateWithFluxFallback(
  prompt: string,
  aspectRatio: string
): Promise<{ imageUrl: string; engine: string }> {
  const { width, height } = getDimensionsForRatio(aspectRatio);
  const seed = Math.floor(Math.random() * 1000000);
  const encodedPrompt = encodeURIComponent(prompt.trim());
  const fallbackUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux`;

  return {
    imageUrl: fallbackUrl,
    engine: "Flux Schnell (High-Fidelity Neural Render)",
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

    // Compose enhanced prompt incorporating brand guidelines & style notes
    let enhancedPrompt = prompt.trim();
    if (stylePreset) {
      enhancedPrompt = `[Style: ${stylePreset}] ${enhancedPrompt}`;
    }
    if (styleNotes) {
      enhancedPrompt += `. Art Direction: ${styleNotes}`;
    }

    // Add subtle brand consistency guidelines if not specified
    if (!enhancedPrompt.includes("#0F172A") && !enhancedPrompt.includes("navy")) {
      enhancedPrompt += ". Professional high-contrast B2B aesthetic, navy (#0F172A), sapphire blue, and emerald accents.";
    }

    console.log(`[IMAGE GENERATOR] Generating (${aspectRatio}): "${enhancedPrompt.slice(0, 80)}..."`);

    let result: { imageUrl: string; engine: string } | null = null;
    const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    // 1. Try Google Imagen 3 if key is configured
    if (geminiKey) {
      result = await generateWithImagen3(enhancedPrompt, aspectRatio, geminiKey);
    }

    // 2. Fall back to Flux Schnell if Imagen 3 is unavailable
    if (!result) {
      result = await generateWithFluxFallback(enhancedPrompt, aspectRatio);
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
      prompt: enhancedPrompt,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Image Generation Error]:", error);
    res.status(500).json({ error: error.message || "Failed to generate visual graphic" });
  }
}
