let taskTitle;
let taskText;
let saveTaskBtn;
let newTaskBtn;
let taskList;

if (window.location.pathname === '/tasks') {
  taskTitle = document.querySelector('.task-title');
  taskText = document.querySelector('.task-textarea');
  saveTaskBtn = document.querySelector('.save-task');
  newTaskBtn = document.querySelector('.new-task');
  taskList = document.querySelectorAll('.list-container .list-group');
}

// Show an element
const show = (elem) => {
  elem.style.display = 'inline';
};

// Hide an element
const hide = (elem) => {
  elem.style.display = 'none';
};

// activeTask is used to keep track of the task in the textarea
let activeTask = {};

const getTasks = () =>
  fetch('/api/tasks', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

const saveTask = (task) =>
  fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });

const deleteTask = (id) =>
  fetch(`/api/tasks/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

const renderActiveTask = () => {
  hide(saveTaskBtn);

  if (activeTask.id) {
    taskTitle.setAttribute('readonly', true);
    taskText.setAttribute('readonly', true);
    taskTitle.value = activeTask.title;
    taskText.value = activeTask.text;
  } else {
    taskTitle.removeAttribute('readonly');
    taskText.removeAttribute('readonly');
    taskTitle.value = '';
    taskText.value = '';
  }
};

const handleTaskSave = () => {
  const newTask = {
    title: taskTitle.value,
    text: taskText.value,
  };
  saveTask(newTask).then(() => {
    getAndRenderTasks();
    renderActiveTask();
  });
};

// Delete the clicked task
const handleTaskDelete = (e) => {
  // Prevents the click listener for the list from being called when the button inside of it is clicked
  e.stopPropagation();

  const task = e.target;
  const taskId = JSON.parse(task.parentElement.getAttribute('data-task')).id;

  if (activetask.id === taskId) {
    activeTask = {};
  }

  deleteTask(taskId).then(() => {
    getAndRenderTasks();
    renderActiveTask();
  });
};

// Sets the activeTask and displays it
const handleTaskView = (e) => {
  e.preventDefault();
  activeTask = JSON.parse(e.target.parentElement.getAttribute('data-task'));
  renderActiveTask();
};

// Sets the activeTask to and empty object and allows the user to enter a new task
const handleNewTaskView = (e) => {
  activeTask = {};
  renderActiveTask();
};

const handleRenderSaveBtn = () => {
  if (!taskTitle.value.trim() || !taskText.value.trim()) {
    hide(saveTaskBtn);
  } else {
    show(saveTaskBtn);
  }
};

// Render the list of task titles
const renderTaskList = async (tasks) => {
  let jsonTasks = await tasks.json();
  if (window.location.pathname === '/tasks') {
    taskList.forEach((el) => (el.innerHTML = ''));
  }

  let taskListItems = [];

  // Returns HTML element with or without a delete button
  const createLi = (text, delBtn = true) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item');

    const spanEl = document.createElement('span');
    spanEl.classList.add('list-item-title');
    spanEl.innerText = text;
    spanEl.addEventListener('click', handleTaskView);

    liEl.append(spanEl);

    if (delBtn) {
      const delBtnEl = document.createElement('i');
      delBtnEl.classList.add(
        'fas',
        'fa-trash-alt',
        'float-right',
        'text-danger',
        'delete-task'
      );
      delBtnEl.addEventListener('click', handleTaskDelete);

      liEl.append(delBtnEl);
    }

    return liEl;
  };

  if (jsonTasks.length === 0) {
    taskListItems.push(createLi('No saved tasks', false));
  }

  jsonTasks.forEach((task) => {
    const li = createLi(task.title);
    li.dataset.task = JSON.stringify(task);

    taskListItems.push(li);
  });

  if (window.location.pathname === '/tasks') {
    taskListItems.forEach((task) => taskList[0].append(task));
  }
};

// Gets tasks from the db and renders them to the sidebar
const getAndRenderTasks = () => getTasks().then(renderTaskList);

if (window.location.pathname === '/tasks') {
  saveTaskBtn.addEventListener('click', handleTaskSave);
  newTaskBtn.addEventListener('click', handleNewTaskView);
  taskTitle.addEventListener('keyup', handleRenderSaveBtn);
  taskText.addEventListener('keyup', handleRenderSaveBtn);
}

getAndRenderTasks();
