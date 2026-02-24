export type Matcher = string | RegExp | ((pathname: string) => boolean);

export type ContentSignals = {
  aiTrain?: boolean;
  search?: boolean;
  aiInput?: boolean;
};

export type MarkdownForAgentsOptions = {
  include?: Matcher[];
  exclude?: Matcher[];
  excludePrefixes?: string[];
  excludeExtensions?: string[];
  markdownDir?: string;
  contentSignals?: ContentSignals;
  maxExtractedChars?: number;
  preferPlainText?: boolean;
};

export type ResolvedOptions = {
  include: Matcher[];
  exclude: Matcher[];
  excludePrefixes: string[];
  excludeExtensions: string[];
  markdownDir: string;
  contentSignalHeader: string;
  maxExtractedChars: number;
  preferPlainText: boolean;
};
