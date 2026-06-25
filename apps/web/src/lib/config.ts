export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? "AeroFlow",
  storageRoot: process.env.STORAGE_ROOT ?? "./storage/documents",
  helpDocsRoot: process.env.HELP_DOCS_ROOT ?? "./storage/help-docs",
};
