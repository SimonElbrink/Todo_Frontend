
import React, {useRef, useState, useEffect} from 'react';
import './Task.css';
import Sidebar from './Sidebar';
import Header from "./Header.jsx";
import {
    createTask,
    getAllTasks,
    deleteTask as deleteTaskApi,
    updateTask as updateTaskApi,
    getTaskByPersonId,
    getOverdueTasks,
} from '../services/taskService';

const Task = () => {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [personName, setPersonName] = useState("");
    const [personId, setPersonId] = useState("");
    const [attachments, setAttachments] = useState([]);
    const [errors, setErrors] = useState({});
    const [, setChosenFiles] = useState("No files chosen");
    const fileInputRef = useRef(null);
    const [filterStatus, setFilterStatus] = useState("all");//all /pending /in-process /completed
    const [sortOrder, setSortOrder] = useState("none");//none, asc, desc
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editDueDate, setEditDueDate] = useState("");
    const [editPersonId, setEditPersonId] = useState("");
    const [editPersonName, setEditPersonName] = useState("");
    const [filterPersonId, setFilterPersonId] = useState("");

    useEffect(() => {
        async function fetchTasks() {
            try {
                const data = await getAllTasks();
                setTasks(data);
            }catch(error) {
                console.log("Failed to load tasks", error);
            }
        }
        fetchTasks();
    }, []);



    // todo*: make this component functional by implementing state management and API calls
    async function addTask(newTask) {
        try {
            const savedTask = await createTask(newTask);
            setTasks((prevTasks) => [...prevTasks, savedTask]);
        } catch (error) {
            console.log("Failed to save task", error);
        }
    }

    async function handleDeleteTask(id) {
        try {
            await deleteTaskApi(id);
            setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
        } catch (error) {
            console.log("Failed to delete task", error);
        }

        }


    async function hadleTaskCompletion(task){
        const updatedTask = {...task, status: "completed"};
        try{
            const savedTask = await updateTaskApi(task.id, updatedTask);
            setTasks((prevTasks)=>prevTasks.map((prevTask)=>prevTask.id===task.id? savedTask:prevTask));
        } catch(error){
            console.log("Failed to complete task", error);
        }
    }
    /*function toggleTaskCompletion(index) {
        setTasks(
        (prevTasks) => prevTasks.map((task, i) => (i === index ? {...task, status: "completed"} : task))
        )
    }*/

    function toggleTaskEditing(index) {
        setTasks((prevTasks)=>prevTasks.map((task,i)=>i===index? {...task, isEditing: !task.isEditing}:task));
    }

    async function handleUpdateTask(id, updatedFields) {
        try {
            const updatedTask = await updateTaskApi(id, updatedFields);

            setTasks((prevTasks)=>prevTasks.map((task)=>task.id===id? updatedTask:task));
        } catch (error) {
            console.log("Failed to update task", error);
        }
    }

    const filteredTasks = tasks.filter((task) => {
        if (filterStatus === "pending") return task.status === "pending";
        if (filterStatus === "in-progress") return task.status === "in-progress";
        if (filterStatus === "completed") return task.status === "completed";
        return true;
    })

    async function handleTaskFilter(a){
        if(a==="overdue"){
            const overDue = await getOverdueTasks();
            setTasks(overDue);
        } else if (a==="byPerson"){
            const taskByPerson = await getTaskByPersonId(filterPersonId);
            setTasks(taskByPerson);
        } else {
            setTasks(await getAllTasks());
        }
    }

    const sortedTasks = [...filteredTasks].sort((a, b) => {
        if (sortOrder === "asc") return a.createdAt - b.createdAt;
        if (sortOrder === "desc") return b.createdAt - a.createdAt;
        return 0;
    })

    const statusTask = (status) => {
        if (status === "pending") return "in-progress";
        return status;
    }

    const statusClasses = {
        pending: "bg-warning text-dark",
        "in-progress": "bg-primary",
        completed: "bg-success",
    };

    function handleAttachment(e) {
        const files = e.target.files;
        const newFiles = files ? Array.from(files) : [];
        (files.length > 0 ? setChosenFiles(files[0].name):"No file chosen");
        setAttachments((prev) => [...prev, ...newFiles]);
    }

    function handleClearAttachment() {
        setAttachments([]);
        setChosenFiles("No files chosen");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    async function handleSubmit(e) {
        const today = new Date().toISOString().split('T')[0];
        e.preventDefault();
        const newTask = {title, description, dueDate: dueDate || today, personId, personName: personName || null, attachments, status: personId ? "in-progress":"pending", isEditing: false, createdAt: new Date().toISOString()};
        const validationErrors = {}
        if (title.trim() === "") {
            validationErrors.title = "Title is required"
        }
        if (description.trim() === "") {
            validationErrors.description = "Description is required"
        }

        if (dueDate.trim() === "") {
            validationErrors.dueDate = "Due date is required"
        }
        if (dueDate !== "" && dueDate < today) {
            validationErrors.dueDate = "Future date required"
        }
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        } if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
            setErrors({})

        await addTask(newTask);

            setTitle("");
            setDescription("");
            setDueDate("");
            setPersonId("");
            setAttachments([]);
            setChosenFiles("No file chosen")
        }

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
                                    <form id="todoForm">
                                        <div className="mb-3">
                                            <label htmlFor="todoTitle" className="form-label">Title</label>
                                            {errors.title && <div className="text-danger small">{errors.title}</div>}
                                            <input type="text" className="form-control" id="todoTitle" required value={title} onChange={(e) => setTitle(e.target.value)}/>
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="todoDescription" className="form-label">Description</label>
                                            {errors.description && <div className="text-danger small">{errors.description}</div>}
                                            <textarea className="form-control" id="todoDescription" rows="3" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="todoDueDate" className="form-label">Due Date</label>
                                                {errors.dueDate && <div className="text-danger small">{errors.dueDate}</div>}
                                                <input type="datetime-local" className="form-control" id="todoDueDate" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="todoPerson" className="form-label">Assign to Person</label>

                                                <select className="form-select" id="todoPerson" value={personId} onChange={(e) => {setPersonId(e.target.value);
                                                setPersonName(e.target.options[e.target.selectedIndex].text);}}>
                                                    <option value="">-- Select Person (Optional) --</option>
                                                    <option value="1">Mehrdad Javan</option>
                                                    <option value="2">Simon Elbrink</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Attachments</label>
                                            <div className="input-group mb-3">
                                                <input type="file" className="form-control" id="todoAttachments" multiple onChange={handleAttachment} ref={fileInputRef}/>
                                                <button className="btn btn-outline-secondary" type="button" onClick={handleClearAttachment}>
                                                    <i className="bi bi-x-lg"></i>
                                                </button>
                                            </div>
                                            <div className="file-list" id="attachmentPreview">
                                                {attachments.length===0 ? (
                                                    <span className="text-muted small">No files selected</span>
                                                ) : (
                                                    <ul className="list-unstyled mb-0">
                                                        {attachments.map((attachment, index) => (
                                                            <li key={index}>
                                                                <span className="text-muted small">{attachment.name}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                            <button type="submit" className="btn btn-primary" onClick={handleSubmit}>
                                                <i className="bi bi-plus-lg me-2"></i>
                                                Add Task
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            <div className="card shadow-sm tasks-list mt-4">
                                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                                    <h5 className="card-title mb-0">Tasks</h5>
                                    <div className="btn-group">
                                        <button className="btn btn-outline-secondary btn-sm"
                                                title="Filter"
                                                type="button"
                                                onClick={() => setFilterStatus(filterStatus==="all" ? "pending" :filterStatus === "pending" ? "in-progress" :
                                                    filterStatus === "in-progress" ? "completed" : "all")}>
                                            <i className="bi bi-funnel"></i>
                                            <span className=" ms-2 badge text-bg-light">
                                             {filterStatus === 'pending' ? 'pending' : filterStatus === 'in-progress' ? 'in-progress' :filterStatus === 'completed' ? 'completed' : 'all'}
                                            </span>
                                        </button>

                                        <button className="btn btn-outline-secondary btn-sm"
                                                title="Sort"
                                                type="button"
                                                onClick={() => setSortOrder(sortOrder === "none" ? "asc" : sortOrder === "asc" ? "desc" : "none")}>
                                            <i className="bi bi-sort-down"></i>
                                            <span className="ms-2 badge text-bg-light">
                                                {sortOrder === 'none' ? 'No sort' : sortOrder === 'asc' ? '↑' : '↓'}
                                                </span>
                                        </button>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="list-group">
                                        {/* Task 1 */}
                                        {sortedTasks.map((task, index) => (
                                        <div className="list-group-item list-group-item-action"
                                        key={task.id ?? index}>
                                            <div className="d-flex w-100 justify-content-between align-items-start">
                                                <div className="flex-grow-1">
                                                    <div className="d-flex justify-content-between">
                                                        {task.isEditing ? (
                                                            <input type="text" className="form-control form-control-sm"
                                                                   value={editTitle || task.title}
                                                            onChange={(e) => setEditTitle(e.target.value)}/>
                                                        ) : (
                                                        <h6 className="mb-1">{task.title}</h6>
                                                        )}
                                                        <small className="text-muted ms-2">Created: {task.createdAt}</small>
                                                    </div>
                                                    {task.isEditing ? (
                                                        <input type="text" className="form-control form-control-sm"
                                                        value={editDescription || task.description}
                                                        onChange={(e) => setEditDescription(e.target.value)}/>
                                                    ) : (
                                                        <p className="mb-1 text-muted small">{task.description}</p>
                                                    )}

                                                    <div className="d-flex align-items-center flex-wrap">
                                                        {task.isEditing ? (
                                                            <input type="datetime-local" className="form-control form-control-sm"
                                                            value={editDueDate || task.dueDate}
                                                            onChange={(e) => setEditDueDate(e.target.value)}/>
                                                        ) : (
                                                            <small className="text-muted me-2">
                                                                <i className="bi bi-calendar-event"></i> Due: {task.dueDate.split('T')[0]}
                                                            </small>
                                                        )}
                                                        {task.isEditing ? (
                                                            <select className="form-control form-control-sm"
                                                            value={editPersonId || task.personId}
                                                            onChange={(e) => {setEditPersonId(e.target.value);
                                                            setEditPersonName(e.target.options[e.target.selectedIndex].text);}}>
                                                                <option value="">-- Select Person (Optional) --</option>
                                                                <option value="1">Mehrdad Javan</option>
                                                                <option value="2">Simon Elbrink</option>
                                                                </select>
                                                       ) : (
                                                            <span className="badge bg-info me-2">
                                                            <i className="bi bi-person"></i>{task.personName || "Unassigned"}
                                                        </span>
                                                        )}

                                                        <span className={`badge me-2 ${statusClasses[task.status] || "bg-secondary"}`}
                                                        style={{cursor:"pointer"}}
                                                        onClick={()=> {
                                                            setTasks(prevTasks=>prevTasks.map((prevTask,i)=>i===index? {...prevTask, status: statusTask(prevTask.status)}:prevTask));
                                                            }

                                                        }>{task.status}</span>
                                                    </div>
                                                </div>
                                                <div className="btn-group ms-3">
                                                    <button className="btn btn-outline-success btn-sm"
                                                            title="Complete"
                                                            type="button"
                                                            onClick={() => hadleTaskCompletion(task)}>
                                                        <i className="bi bi-check-lg"></i>
                                                    </button>
                                                    <button className="btn btn-outline-primary btn-sm"
                                                            title="Edit"
                                                            type="button"
                                                            onClick={() => toggleTaskEditing(index)}>
                                                        <i className="bi bi-pencil"></i>
                                                    </button>
                                                    <button className="btn btn-outline-danger btn-sm"
                                                            title="Delete"
                                                            type="button"
                                                            onClick={() => handleDeleteTask(task.id)}>
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                    {task.isEditing && (
                                                        <>
                                                        <button className="btn btn-outline-secondary btn-sm"
                                                                title="Save"
                                                                type="button"
                                                                onClick={() => { const updatedFields = {
                                                                    title: editTitle || task.title,
                                                                    description: editDescription || task.description,
                                                                    dueDate: editDueDate || task.dueDate,
                                                                    personId: editPersonId || task.personId,
                                                                    personName: editPersonName || task.personName,
                                                                    status: task.status,
                                                                    attachments:task.attachments,};
                                                                    handleUpdateTask(task.id, updatedFields);
                                                                    toggleTaskEditing(index)}}>
                                                            <i className="bi bi-check2-circle">Save</i>
                                                        </button>
                                                        <button type="button"
                                                        className="btn btn-secondary btn-sm p-1 ms-1"
                                                        onClick={()=>toggleTaskEditing(index)}> Cancel </button>
                                                        </>
                                                    )}
                                                </div>

                                            </div>
                                        </div>
                                        ))}

                                        {/* Task 2 */}
                                        <div className="list-group-item list-group-item-action">
                                            <div className="d-flex w-100 justify-content-between align-items-start">
                                                <div className="flex-grow-1">
                                                    <div className="d-flex justify-content-between">
                                                        <h6 className="mb-1">Review Code Changes</h6>
                                                        <small className="text-muted ms-2">Created: 2025-08-06</small>
                                                    </div>
                                                    <p className="mb-1 text-muted small">Review and approve pending pull requests</p>
                                                    <div className="d-flex align-items-center flex-wrap">
                                                        <small className="text-muted me-2">
                                                            <i className="bi bi-calendar-event"></i> Due: 2025-08-09
                                                        </small>
                                                        <span className="badge bg-info me-2">
                                                            <i className="bi bi-person"></i> Simon Elbrink
                                                        </span>
                                                        <span className="badge bg-primary me-2">in-progress</span>
                                                    </div>
                                                </div>
                                                <div className="btn-group ms-3">
                                                    <button className="btn btn-outline-success btn-sm" title="Complete">
                                                        <i className="bi bi-check-lg"></i>
                                                    </button>
                                                    <button className="btn btn-outline-primary btn-sm" title="Edit">
                                                        <i className="bi bi-pencil"></i>
                                                    </button>
                                                    <button className="btn btn-outline-danger btn-sm" title="Delete">
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Task 3 */}
                                        <div className="list-group-item list-group-item-action">
                                            <div className="d-flex w-100 justify-content-between align-items-start">
                                                <div className="flex-grow-1">
                                                    <div className="d-flex justify-content-between">
                                                        <h6 className="mb-1">Deploy Application Updates</h6>
                                                        <small className="text-muted ms-2">Created: 2025-08-05</small>
                                                    </div>
                                                    <p className="mb-1 text-muted small">Deploy the latest version to production</p>
                                                    <div className="d-flex align-items-center flex-wrap">
                                                        <small className="text-muted me-2">
                                                            <i className="bi bi-calendar-event"></i> Due: 2025-08-07
                                                        </small>
                                                        <span className="badge bg-info me-2">
                                                            <i className="bi bi-person"></i> Mehrdad Javan
                                                        </span>
                                                        <span className="badge bg-success me-2">completed</span>
                                                    </div>
                                                </div>
                                                <div className="btn-group ms-3">
                                                    <button className="btn btn-outline-success btn-sm" title="Complete">
                                                        <i className="bi bi-check-lg"></i>
                                                    </button>
                                                    <button className="btn btn-outline-primary btn-sm" title="Edit">
                                                        <i className="bi bi-pencil"></i>
                                                    </button>
                                                    <button className="btn btn-outline-danger btn-sm" title="Delete">
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
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