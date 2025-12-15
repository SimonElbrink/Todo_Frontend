import React, { useEffect, useState } from "react";
import "./Task.css";
import Sidebar from "./Sidebar";
import Header from "./Header.jsx";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../services/taskService.js";
const Task = () => {
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortType, setSortType] = useState("createdAt-desc");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [tasks, setTasks] = React.useState([
    {
      id: 1,
      title: "Complete Project Documentation",
      description: "Write comprehensive documentation for the new features",
      createdAt: "2025-08-07",
      dueDate: "2025-08-15",
      assignedTo: "Mehrdad Javan",
      status: "pending",
    },
    {
      id: 2,
      title: "Review Code Changes",
      description: "Review and approve pending pull requests",
      createdAt: "2025-08-06",
      dueDate: "2025-08-09",
      assignedTo: "Simon Elbrink",
      status: "in-progress",
    },
    {
      id: 3,
      title: "Deploy Application Updates",
      description: "Deploy the latest version to production",
      createdAt: "2025-08-05",
      dueDate: "2025-08-07",
      assignedTo: "Mehrdad Javan",
      status: "completed",
    },
  ]);
  const [form, setForm] = React.useState({
    title: "",
    description: "",
    dueDate: "",
    assignedTo: "",
    attachments: [],
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await getTasks();
      setTasks(response.data);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    }
  };

  const handleInput = (e) => {
    setForm({
      ...form,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingTaskId) {
        await updateTask(editingTaskId, form);
        setEditingTaskId(null);
      } else {
        await createTask(form);
      }

      setForm({
        title: "",
        description: "",
        dueDate: "",
        assignedTo: "",
        attachments: [],
      });
      loadTasks();
    } catch (error) {
      console.error("Failed to save task:", error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      loadTasks();
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleCompleteTask = async (taskId) => {
   try {
    const taskToUpdate = tasks.find((task) => task.id === taskId);
    await updateTask(taskId, { ...taskToUpdate, status: "completed" });
    loadTasks();
  } catch (error) {
    console.error("Failed to complete task:", error);
  }
  };

  const handleEditTask = (task) => {
    setForm({
      title: task.title,
      description: task.description || "",
      dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
      assignedTo: task.assignedTo || "",
      attachments: task.attachments || [],
    });
    setEditingTaskId(task.id);
  };

 

  const filteredTasks = tasks
    .filter((task) => {
      if (filterStatus === "all") return true;
      return task.status === filterStatus;
    })
    .sort((a, b) => {
      if (sortType === "createdAt-desc") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortType === "createdAt-asc") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      return 0;
    });
  // todo*: make this component functional by implementing state management and API calls

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={false} onClose={() => {}} />
      <main className="dashboard-main">
        <Header
          title="Tasks"
          subtitle="Manage and organize your tasks"
          onToggleSidebar={() => {}}
        />

        <div className="dashboard-content">
          <div className="row">
            <div className="col-md-8 mx-auto">
              <div className="card shadow-sm task-form-section">
                <div className="card-body">
                  <h2 className="card-title mb-4">Add New Task</h2>
                  <form id="todoForm" onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="todoTitle" className="form-label">
                        Title
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="title"
                        value={form.title}
                        onChange={handleInput}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="todoDescription" className="form-label">
                        Description
                      </label>
                      <textarea
                        className="form-control"
                        id="description"
                        value={form.description}
                        onChange={handleInput}
                      ></textarea>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="todoDueDate" className="form-label">
                          Due Date
                        </label>
                        <input
                          type="datetime-local"
                          className="form-control"
                          id="dueDate"
                          value={form.dueDate}
                          onChange={handleInput}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="todoPerson" className="form-label">
                          Assign to Person
                        </label>
                        <select
                          className="form-select"
                          id="assignedTo"
                          value={form.assignedTo}
                          onChange={handleInput}
                        >
                          <option value="">
                            -- Select Person (Optional) --
                          </option>
                          <option value="1">Mehrdad Javan</option>
                          <option value="2">Simon Elbrink</option>
                        </select>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Attachments</label>
                      <div className="input-group mb-3">
                        <input
                          type="file"
                          className="form-control"
                          id="todoAttachments"
                          multiple
                          onChange={(e) =>
                            setForm({
                              ...form,
                              attachments: Array.from(e.target.files),
                            })
                          }
                        />
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                        >
                          <i className="bi bi-x-lg"></i>
                        </button>
                      </div>
                      <div className="file-list" id="attachmentPreview"></div>
                    </div>
                    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        onClick={handleSubmit}
                      >
                        <i className="bi bi-plus-lg me-2"></i>
                            {editingTaskId ? "Save Changes" : "Add Task"}

                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="card shadow-sm tasks-list mt-4">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">Tasks</h5>
                  <div className="btn-group">
                    <div className="dropdown">
                      <button
                        className="btn btn-outline-secondary btn-sm dropdown-toggle"
                        data-bs-toggle="dropdown"
                      >
                        <i className="bi bi-funnel"></i>
                      </button>
                      <ul className="dropdown-menu">
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => setFilterStatus("all")}
                          >
                            All
                          </button>
                        </li>
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => setFilterStatus("pending")}
                          >
                            Pending
                          </button>
                        </li>
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => setFilterStatus("in-progress")}
                          >
                            In Progress
                          </button>
                        </li>
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => setFilterStatus("completed")}
                          >
                            Completed
                          </button>
                        </li>
                      </ul>
                    </div>

                    <div className="dropdown ms-2">
                      <button
                        className="btn btn-outline-secondary btn-sm dropdown-toggle"
                        data-bs-toggle="dropdown"
                      >
                        <i className="bi bi-sort-down"></i>
                      </button>
                      <ul className="dropdown-menu">
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => setSortType("createdAt-desc")}
                          >
                            Newest first
                          </button>
                        </li>
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => setSortType("createdAt-asc")}
                          >
                            Oldest first
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="list-group">
                    {/* Task 1 */}
                    {editingTask && (
                      <div className="card mb-3 shadow-sm">
                        <div className="card-body">
                          <h5>Edit Task</h5>
                          <form onSubmit={handleSaveEdit}>
                            <input
                              type="text"
                              id="title"
                              value={editingTask.title}
                              onChange={handleEditInput}
                              className="form-control mb-2"
                              required
                            />
                            <textarea
                              id="description"
                              value={editingTask.description}
                              onChange={handleEditInput}
                              className="form-control mb-2"
                            />
                            <input
                              type="datetime-local"
                              id="dueDate"
                              value={editingTask.dueDate}
                              onChange={handleEditInput}
                              className="form-control mb-2"
                            />
                            <input
                              type="text"
                              id="assignedTo"
                              value={editingTask.assignedTo}
                              onChange={handleEditInput}
                              className="form-control mb-2"
                            />
                            <div className="d-flex justify-content-end">
                              <button
                                type="button"
                                className="btn btn-secondary me-2"
                                onClick={() => setEditingTask(null)}
                              >
                                Cancel
                              </button>
                              <button type="submit" className="btn btn-primary">
                                Save
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}
                    <div className="list-group">
                      {filteredTasks.length === 0 && (
                        <p className="text-center text-muted">No items yet</p>
                      )}

                      {filteredTasks.length > 0 &&
                        filteredTasks.map((task) => (
                          <div
                            className="list-group-item list-group-item-action"
                            key={task.id}
                          >
                            <div className="d-flex w-100 justify-content-between align-items-start">
                              <div className="flex-grow-1">
                                <div className="d-flex justify-content-between">
                                  <h6 className="mb-1">{task.title}</h6>
                                  <small className="text-muted ms-2">
                                    Created: {task.createdAt}
                                  </small>
                                </div>

                                <p className="mb-1 text-muted small">
                                  {task.description}
                                </p>

                                <div className="d-flex align-items-center flex-wrap">
                                  <small className="text-muted me-2">
                                    <i className="bi bi-calendar-event"></i>{" "}
                                    Due: {task.dueDate}
                                  </small>

                                  <span className="badge bg-info me-2">
                                    <i className="bi bi-person"></i>{" "}
                                    {task.assignedTo}
                                  </span>

                                  <span className="badge bg-warning text-dark me-2">
                                    {task.status}
                                  </span>
                                </div>
                              </div>

                              <div className="btn-group ms-3">
                                <button
                                  onClick={() => handleCompleteTask(task.id)}
                                  className="btn btn-outline-success btn-sm"
                                  title="Complete"
                                >
                                  <i className="bi bi-check-lg"></i>
                                </button>
                                <button
                                  className="btn btn-outline-primary btn-sm"
                                  onClick={() => handleEditTask(task)}
                                  title="Edit"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => handleDeleteTask(task.id)}
                                  title="Delete"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Task;
