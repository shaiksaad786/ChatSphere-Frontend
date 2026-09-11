import api from "./api";

export const sendMessage = async (messageData) => {
  const response = await api.post(
    "/messages",
    messageData
  );

  return response.data;
};

export const getMessages = async (conversationId) => {
  const response = await api.get(
    `/messages/${conversationId}`
  );

  return response.data;
};

export const markMessageRead = async (messageId) => {
  const response = await api.put(
    `/messages/${messageId}/read`
  );

  return response.data;
};

export const markMessageDelivered = async (
  messageId
) => {
  const response = await api.put(
    `/messages/${messageId}/delivered`
  );

  return response.data;
};

export const editMessage = async (
  messageId,
  text
) => {
  const response = await api.put(
    `/messages/${messageId}`,
    {
      text,
    }
  );

  return response.data;
};

export const deleteMessage = async (
  messageId
) => {
  const response = await api.delete(
    `/messages/${messageId}`
  );

  return response.data;
};