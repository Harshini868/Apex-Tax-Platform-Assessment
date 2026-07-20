export interface HighlightedRegion {
  id: string;
  label: string;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
  extractedText: string;
}

export interface DocumentPage {
  pageNumber: number;
  sectionLabel: string;
  previewType: 'W2' | '1099B' | '1099INT' | 'K1' | 'BankStmt';
  highlightedRegions: HighlightedRegion[];
}

export interface SourceDocument {
  id: string;
  fileName: string;
  documentType: string;
  uploadedAt: string;
  pageCount: number;
  pages: DocumentPage[];
  simulated: boolean;
}
