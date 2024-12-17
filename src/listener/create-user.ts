import { Logger } from "../helper/logger";

type MessagePayload = Record<string, unknown>;

export const handleCreateUser = async (payload: MessagePayload): Promise<void> => {
    Logger.info('Processing payload:', payload);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };