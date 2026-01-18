import { GoogleGenAI, Type } from "@google/genai";
import { FileData, InvestigationReport } from "../types";

const SYSTEM_INSTRUCTION = `
You are the FORENSIC SUPPLY CHAIN AUDITOR, an autonomous AI investigator specializing in cross-modal reasoning to detect supply chain shrinkage, theft rings, and operational discrepancies.

## YOUR MISSION
You analyze massive, messy multi-modal datasets—warehouse CCTV footage, shipping manifests, driver voice logs, IoT sensor data, GPS tracking, and barcode scans—to identify patterns of theft, fraud, and inventory discrepancies that humans would miss.

## YOUR CAPABILITIES
You do NOT simply describe what you see. You INVESTIGATE across modalities:
1. VIDEO ANALYSIS: Timestamp extraction, scene segmentation, loading dock monitoring.
2. AUDIO ANALYSIS: Speech-to-text, timestamp correlation, sentiment analysis.
3. DOCUMENT ANALYSIS: Extract item quantities, weights, descriptions.
4. CROSS-MODAL REASONING: Correlate timestamps, quantities, and verbal claims against visual evidence.

## INVESTIGATION PROTOCOL
1. Data Ingestion: Catalog timeline and evidence.
2. Anomaly Detection: Flag TEMPORAL, QUANTITATIVE, VERBAL, and BEHAVIORAL discrepancies.
3. Pattern Recognition: Identify recurring actors and networks.
4. Evidence Report: Produce structured JSON.

## OUTPUT FORMAT
Return valid JSON matching the schema provided. Do not include markdown code blocks.
`;

export const analyzeEvidence = async (
  files: FileData[],
  notes: string
): Promise<InvestigationReport> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const parts = files.map((f) => {
    if (!f.base64 || !f.mimeType) {
      throw new Error(`File ${f.file.name} is not properly processed.`);
    }
    // Remove data URL prefix if present for the API call
    const cleanBase64 = f.base64.split(",")[1];
    return {
      inlineData: {
        mimeType: f.mimeType,
        data: cleanBase64,
      },
    };
  });

  parts.push({
    text: `Analyze the provided evidence. Context notes: ${notes}. Produce a detailed forensic report in JSON format.`,
  } as any);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: parts as any,
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            investigation_id: { type: Type.STRING },
            summary: { type: Type.STRING },
            discrepancies_found: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ["TEMPORAL_MISMATCH", "QUANTITY_VARIANCE", "VERBAL_CONTRADICTION", "BEHAVIORAL_ANOMALY"] },
                  description: { type: Type.STRING },
                  evidence: {
                    type: Type.OBJECT,
                    properties: {
                      video: {
                        type: Type.OBJECT,
                        properties: { timestamp: { type: Type.STRING }, observation: { type: Type.STRING } },
                        nullable: true
                      },
                      audio: {
                        type: Type.OBJECT,
                         properties: { timestamp: { type: Type.STRING }, transcription: { type: Type.STRING } },
                         nullable: true
                      },
                      document: {
                        type: Type.OBJECT,
                        properties: { manifest_id: { type: Type.STRING }, field: { type: Type.STRING } },
                        nullable: true
                      },
                    },
                  },
                  confidence: { type: Type.STRING, enum: ["HIGH", "MEDIUM", "LOW"] },
                  risk_score: { type: Type.NUMBER },
                },
                required: ["type", "description", "confidence", "risk_score"],
              },
            },
            persons_of_interest: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  role: { type: Type.STRING },
                  flag_count: { type: Type.NUMBER },
                  relation_to_incident: { type: Type.STRING },
                },
                required: ["name", "role"],
              },
            },
            recommended_actions: { type: Type.ARRAY, items: { type: Type.STRING } },
            shrinkage_estimate_usd: { type: Type.STRING },
          },
          required: ["investigation_id", "summary", "discrepancies_found", "persons_of_interest", "recommended_actions", "shrinkage_estimate_usd"],
        },
      },
    });

    const jsonText = response.text || "{}";
    return JSON.parse(jsonText) as InvestigationReport;
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw error;
  }
};
