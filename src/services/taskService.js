import api from "./api";

export const getTasks = () => api.get("/todo");               
export const createTask = async (task) => {
  const formData = new FormData();

  formData.append(
    "todo",
    new Blob([JSON.stringify(task)], { type: "application/json" })
  );

  if (task.attachments && task.attachments.length > 0) {
    task.attachments.forEach((file) => {
      formData.append("files", file);
    });
  }

  return api.post("/todo", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
export const updateTask = async (id, task) => {
  const formData = new FormData();

  
  formData.append(
    "todo",
    new Blob(
      [
        JSON.stringify({
          id: task.id,
          title: task.title,                 
          description: task.description ?? "",
          completed: task.completed ?? false,
          dueDate: task.dueDate ?? null,
          personId: task.personId ?? null,
          attachments: []                    
        })
      ],
      { type: "application/json" }
    )
  );

 
  if (task.attachments && task.attachments.length > 0) {
    task.attachments.forEach(file => {
      formData.append("files", file);
    });
  }

  return api.put(`/todo/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};
export const deleteTask = (id) => api.delete(`/todo/${id}`); 
export const toggleTaskCompletion = (id) => api.patch(`/todo/${id}/toggle`); 


