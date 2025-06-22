import type { ResumeDto } from "@reactive-resume/dto";

import { axios } from "@/client/libs/axios";

export const findResumeById = async (data: { id: string }) => {
  const response = await axios.get<ResumeDto>(`/resume/${data.id}`);

  return response.data;
};

export const findResumeByUsernameSlug = async (data: { username: string; slug: string; t: string }) => {
  const response = await axios.get<ResumeDto>(`/resume/public/${data.username}/${data.slug}/${data.t}`);

  return response.data;
};
