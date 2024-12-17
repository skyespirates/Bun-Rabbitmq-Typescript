import { Logger } from "./logger";
// Utility function to handle errors
export const handleError = (context: string, error: unknown): void => {
    Logger.error(`[${context}]`, error);
  };