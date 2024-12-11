type MessagePayload = Record<string, unknown>;

export const handleCreateUser = async (payload: MessagePayload): Promise<void> => {
    console.log('Processing payload:', payload);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };