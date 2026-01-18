export interface InvestigationEvidence {
  video: { timestamp: string; observation: string } | null;
  audio: { timestamp: string; transcription: string } | null;
  document: { manifest_id: string; field: string } | null;
}

export interface Discrepancy {
  type: "TEMPORAL_MISMATCH" | "QUANTITY_VARIANCE" | "VERBAL_CONTRADICTION" | "BEHAVIORAL_ANOMALY";
  description: string;
  evidence: InvestigationEvidence;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  risk_score: number;
}

export interface PersonOfInterest {
  name: string;
  role: string;
  flag_count: number;
  relation_to_incident: string;
}

export interface InvestigationReport {
  investigation_id: string;
  summary: string;
  discrepancies_found: Discrepancy[];
  persons_of_interest: PersonOfInterest[];
  recommended_actions: string[];
  shrinkage_estimate_usd: string;
}

export interface FileData {
  file: File;
  type: 'video' | 'audio' | 'document';
  previewUrl?: string;
  base64?: string;
  mimeType?: string;
}
