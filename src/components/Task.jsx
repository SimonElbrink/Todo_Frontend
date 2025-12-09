
import React from 'react';
import './Task.css';
import Sidebar from './Sidebar';
import Header from "./Header.jsx";

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

    function deleteTask(index) {
        setTasks((prevTasks) => prevTasks.filter((_, i) => i !== index));
    }

    function toggleTaskCompletion(index) {
        setTasks(
            (prevTasks) => prevTasks.map((task, i) => (i === index ? {...task, status: "completed"} : task))
        )
    }

    function toggleTaskEditing(index) {
        setTasks((prevTasks)=>prevTasks.map((task,i)=>i===index? {...task, isEditing: !task.isEditing}:task));
    }

    function toggleTaskUpdating(index, updatedFields) {
        setTasks((prevTasks)=>prevTasks.map((task,i)=>i===index? {...task, ...updatedFields}:task));
    }

    const filteredTasks = tasks.filter((task) => {
        if (filterStatus === "pending") return task.status === "pending";
        if (filterStatus === "in-progress") return task.status === "in-progress";
        if (filterStatus === "completed") return task.status === "completed";
        return true;
    })

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

    function handleAssigneeChange(selectedPerson) {
        setTasks((prevTasks) => ({
            ...prevTasks,
            personId: selectedPerson.value,
            personName: selectedPerson.label,
            status: "in-progress",
        }));
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
                                            <input type="text" className="form-control" id="todoTitle" required />
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="todoDescription" className="form-label">Description</label>
                                            <textarea className="form-control" id="todoDescription" rows="3"></textarea>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="todoDueDate" className="form-label">Due Date</label>
                                                <input type="datetime-local" className="form-control" id="todoDueDate" />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label htmlFor="todoPerson" className="form-label">Assign to Person</label>
                                                <select className="form-select" id="todoPerson">
                                                    <option value="">-- Select Person (Optional) --</option>
                                                    <option value="1">Mehrdad Javan</option>
                                                    <option value="2">Simon Elbrink</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Attachments</label>
                                            <div className="input-group mb-3">
                                                <input type="file" className="form-control" id="todoAttachments" multiple />
                                                <button className="btn btn-outline-secondary" type="button">
                                                    <i className="bi bi-x-lg"></i>
                                                </button>
                                            </div>
                                            <div className="file-list" id="attachmentPreview"></div>
                                        </div>
                                        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                            <button type="submit" className="btn btn-primary">
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
                                        <button className="btn btn-outline-secondary btn-sm" title="Filter">
                                            <i className="bi bi-funnel"></i>
                                        </button>
                                        <button className="btn btn-outline-secondary btn-sm" title="Sort">
                                            <i className="bi bi-sort-down"></i>
                                        </button>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="list-group">
                                        {/* Task 1 */}
                                        <div className="list-group-item list-group-item-action">
                                            <div className="d-flex w-100 justify-content-between align-items-start">
                                                <div className="flex-grow-1">
                                                    <div className="d-flex justify-content-between">
                                                        <h6 className="mb-1">Complete Project Documentation</h6>
                                                        <small className="text-muted ms-2">Created: 2025-08-07</small>
                                                    </div>
                                                    <p className="mb-1 text-muted small">Write comprehensive documentation for the new features</p>
                                                    <div className="d-flex align-items-center flex-wrap">
                                                        <small className="text-muted me-2">
                                                            <i className="bi bi-calendar-event"></i> Due: 2025-08-15
                                                        </small>
                                                        <span className="badge bg-info me-2">
                                                            <i className="bi bi-person"></i> Mehrdad Javan
                                                        </span>
                                                        <span className="badge bg-warning text-dark me-2">pending</span>
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