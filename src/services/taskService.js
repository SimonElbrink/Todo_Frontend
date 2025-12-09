//*todo: implement taskService and call the API
const API_BASE = "http://localhost:9090/api/todo";

function getAuthToken() {
    const token = localStorage.getItem("auth_token");
    return token ? { Authorization: `Bearer ${token}`} : {};
}

// from backend to frontend
export function mapFromBackend(apiTask) {
    const PERSONS = {
        1: "Mehrdad Javan",
        2: "Simon Elbrink",
    }
    let status;
    if(apiTask.completed) {
        status = "completed";
    } else if (apiTask.personId) {
        status = "in-progress";
    } else {
        status = "pending";
    }
  return {
      id: apiTask.id,
      title: apiTask.title,
      description: apiTask.description,
      dueDate: apiTask.dueDate,
      personId: apiTask.personId,
      personName: PERSONS[apiTask.personId] || null,
      createdAt: apiTask.createdAt.split("T")[0],
      status,
      completed: apiTask.completed ? "completed" : "pending",
      isEditing: false,
      attachments: apiTask.attachments || [],
  };
}

// from frontend to backend
export function mapToBackend(task) {
  return {
      title: task.title,
      description: task.description,
      completed: task.status === "completed",
      dueDate: task.dueDate,
      personId: task.personId ? Number(task.personId) : null,
      attachments: task.attachments || [],

      //TODO: //attachments
  };
}
// new task
export async function createTask(task) {
    const body = mapToBackend(task);
    const formData = new FormData();

    formData.append("todo", new Blob ([JSON.stringify(body)], {type: "application/json"}));

    if(task.attachments && task.attachments.length > 0) {
        task.attachments.forEach(file => {formData.append("files", file)})
    }
    const res = await fetch(API_BASE, {
        method: "POST",
        headers: {
        ...getAuthToken()
        },
        body: formData,
    });
    if (!res.ok) {
        throw new Error("Failed to create task");
    }
    const data = await res.json();
    return mapFromBackend(data);
}

// get all tasks
export async function getAllTasks() {
    const res = await fetch(API_BASE, {
        method: "GET",
        headers: {
        ...getAuthToken()},
    });
    if (!res.ok) {
        throw new Error("Failed to fetch tasks");
    }
    const data = await res.json();
    return data.map(mapFromBackend);
}

// delete task
export async function deleteTask(id) {
    const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: {
        ...getAuthToken()},
    });
    if (!res.ok) {
        throw new Error("Failed to delete task");
    }
}

// update task
export async function updateTask(id, task) {
    const body = mapToBackend(task);
    const formData = new FormData();

    formData.append(
        "todo",
        new Blob ([JSON.stringify(body)], {type: "application/json"})
    )

    const res = await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: {
        ...getAuthToken()},
        body: formData,
    });
    if (!res.ok) {
        const text = await res.text().catch(()=>"");
        console.error("Update failed:", res.status, text);
        throw new Error("Failed to update task");
    }
    const data = await res.json();
    return mapFromBackend(data);
}