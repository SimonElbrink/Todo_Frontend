import React, { useState, useEffect, use } from "react";
import "./Dashboard.css";
import Sidebar from "./Sidebar";
import Header from "./Header.jsx";
import Task from "./Task.jsx";
import {
  updateTask,
  getTasks,
  deleteTask as deleteTaskApi,
  toggleTaskCompletion,
} from "../services/taskService.js";
import { getPersons } from "../services/person.js";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [usersCount, setUsersCount] = useState(0);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    getTasks().then((res) => {
      const normalized = res.data.map((task) => ({
        ...task,

        status: task.completed ? "completed" : "pending",
        dueDate: task.dueDate || task.due_date,
        team: task.team || "General",
      }));

      setTasks(normalized);
    });
  }, []);

  const pendingCount = tasks.filter((task) => task.status === "pending").length;
  const inProgressCount = tasks.filter(
    (task) => task.status === "in-progress"
  ).length;
  const completedCount = tasks.filter(
    (task) => task.status === "completed"
  ).length;
  const overdueTasksCount = tasks.filter(
    (task) => new Date(task.dueDate) < new Date() && task.status !== "completed"
  ).length;

  const markComplete = async (taskId) => {
    try {
      await toggleTaskCompletion(taskId);

      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === taskId ? { ...t, completed: true, status: "completed" } : t
        )
      );
    } catch (e) {
      console.error("Completion error:", e);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await deleteTaskApi(taskId);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (e) {
      console.error("Delete error:", e);
    }
  };

  const editTask = async (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newTitle = prompt("Edit Task Title:", task.title);
    if (!newTitle) return;

    const newDescription = prompt(
      "Edit Task Description:",
      task.description || ""
    );

    const newDueDate = prompt(
      "Edit Due Date (YYYY-MM-DD):",
      task.dueDate ? task.dueDate.split("T")[0] : ""
    );

    const newPersonId = prompt(
      "Edit Assigned Person ID (leave blank for none):",
      task.personId || ""
    );

    const updatedTask = {
      ...task,
      title: newTitle,
      description: newDescription,
      dueDate: newDueDate,
      personId: newPersonId || null,
      attachments: task.attachments || [],
      completed: task.completed || false,
    };

    try {
      await updateTask(taskId, updatedTask);

      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === taskId ? { ...t, ...updatedTask } : t))
      );
    } catch (error) {
      console.error("Edit error:", error);
    }
  };

  useEffect(() => {
    const loadPersons = async () => {
      try {
        const res = await getPersons();
        setUsersCount(res.data.length);
        console.log("Persons:", res.data);
      } catch (error) {
        console.error("Error loading persons:", error);
      }
    };

    loadPersons();
  }, []);

  const today = new Date();
  const sortedTasks = [...tasks].sort(
    (a, b) => new Date(b.dueDate) - new Date(a.dueDate)
  );

  const recentTasks = sortedTasks.filter(
    (task) => new Date(task.dueDate) >= today
  );

  const visibleRecentTasks = showAll ? recentTasks : recentTasks.slice(0, 3);

  const overdueTasks = sortedTasks.filter(
    (task) => new Date(task.dueDate) < today && task.status !== "completed"
  );

  const visibleOverdueTasks = showAll ? overdueTasks : overdueTasks.slice(0, 3);

  const TaskTable = ({ tasks, title, isOverdue }) => (
    <div className="tasks-section">
      <div className="section-header">
        <h2>
          <span className={isOverdue ? "text-danger" : ""}>{title}</span>
          {isOverdue && (
            <span className="badge bg-danger ms-2">{tasks.length}</span>
          )}
        </h2>
        <button
          className="btn btn-link text-decoration-none"
          onClick={() => setShowAll((prev) => !prev)}
        >
          View All
          <i className="bi bi-arrow-right ms-2"></i>
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th scope="col" style={{ width: "40px" }}>
                #
              </th>
              <th scope="col">Task</th>
              <th scope="col">Team</th>
              <th scope="col">Due Date</th>
              <th scope="col" style={{ width: "120px" }}>
                Status
              </th>
              <th scope="col" style={{ width: "60px" }}></th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, index) => (
              <tr key={task.id}>
                <td>{index + 1}</td>
                <td>
                  <div className="fw-medium">{task.title}</div>
                </td>
                <td>{task.team}</td>
                <td>
                  <div className={isOverdue ? "text-danger" : ""}>
                    {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                </td>
                <td>
                  <span className={`badge ${getStatusBadgeClass(task.status)}`}>
                    {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </span>
                </td>
                <td>
                  <div className="dropdown">
                    <button
                      className="btn btn-link btn-sm p-0"
                      data-bs-toggle="dropdown"
                    >
                      <i className="bi bi-three-dots-vertical"></i>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li>
                        <button
                          onClick={() => editTask(task.id)}
                          className="dropdown-item"
                        >
                          Edit
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => markComplete(task.id)}
                        >
                          Mark Complete
                        </button>
                      </li>
                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                      <li>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="dropdown-item text-danger"
                        >
                          Delete
                        </button>
                      </li>
                    </ul>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-warning text-dark";
      case "in-progress":
        return "bg-primary";
      case "completed":
        return "bg-success";
      default:
        return "bg-secondary";
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="dashboard-main">
        <Header
          title="Dashboard"
          subtitle="Welcome back! Here's your tasks overview"
          onToggleSidebar={() => setIsSidebarOpen(true)}
        />

        <div className="dashboard-content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon pending">
                <i className="bi bi-hourglass-split"></i>
              </div>
              <div className="stat-info">
                <h3>Pending</h3>
                <p className="stat-number">{pendingCount}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon in-progress">
                <i className="bi bi-arrow-clockwise"></i>
              </div>
              <div className="stat-info">
                <h3>In Progress</h3>
                <p className="stat-number">{inProgressCount}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon completed">
                <i className="bi bi-check2-circle"></i>
              </div>
              <div className="stat-info">
                <h3>Completed</h3>
                <p className="stat-number">{completedCount}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon overdue">
                <i className="bi bi-hourglass-split"></i>
              </div>
              <div className="stat-info">
                <h3>Overdue</h3>
                <p className="stat-number">{overdueTasksCount}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon info">
                <i className="bi bi-people"></i>
              </div>
              <div className="stat-info">
                <h3>Users</h3>
                <p className="stat-number">{usersCount}</p>
              </div>
            </div>
          </div>

          <div className="tasks-grid">
            <TaskTable
              tasks={visibleRecentTasks}
              title="Recent Tasks"
              isOverdue={false}
            />
            <TaskTable
              tasks={visibleOverdueTasks}
              title="Overdue Tasks"
              isOverdue={true}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
