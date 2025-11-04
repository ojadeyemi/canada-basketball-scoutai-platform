export interface PDFJobStatus {
  id: string;
  session_id: string;
  player_name: string;
  status: "pending" | "processing" | "completed" | "failed";
  gcs_url?: string;
  created_at: string;
  completed_at?: string;
  error?: string;
}
