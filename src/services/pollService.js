import api from "./api";

export const createPoll = async (
  pollData
) => {
  const response = await api.post(
    "/polls",
    pollData
  );

  return (
    response.data?.data?.poll ||
    response.data?.poll ||
    response.data
  );
};

export const getPoll = async (
  pollId
) => {
  const response = await api.get(
    `/polls/${pollId}`
  );

  return (
    response.data?.data?.poll ||
    response.data?.data ||
    response.data
  );
};

export const votePoll = async (
  pollId,
  optionId
) => {
  const response = await api.post(
    `/polls/${pollId}/vote`,
    {
      optionId,
    }
  );

  return (
    response.data?.data?.poll ||
    response.data?.data ||
    response.data
  );
};

export const deletePoll = async (
  pollId
) => {
  const response = await api.delete(
    `/polls/${pollId}`
  );

  return response.data;
};