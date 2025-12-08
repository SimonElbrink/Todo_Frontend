import api from "./api";

export const getPersons = () => api.get("/person");
export const getPersonById = (id) => api.get(`/person/${id}`);
export const createPerson = (data) => api.post("/person/register", data);
export const updatePerson = (id, data) => api.put(`/person/${id}`, data);
export const deletePerson = (id) => api.delete(`/person/${id}`);