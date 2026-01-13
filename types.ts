export interface StoryboardPanel {
  id: string;
  sequenceNumber: number;
  scriptSegment: string;
  inferredLocation?: string;
  inferredTime?: string;
  inferredAction?: string;
  inferredCharacters?: string;
  inferredMood?: string;
  // User editable fields (initially populated by AI or empty)
  environmentNotes: string;
  actionNotes: string;
  characterNotes: string;
  expressionNotes: string;
  moodNotes: string;
}

export interface ParsingStatus {
  isLoading: boolean;
  error: string | null;
  progress: number; // 0 to 100
}