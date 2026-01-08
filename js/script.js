/* ---------------- DOM ELEMENTS ---------------- */
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const activeCount = document.getElementById("activeCount");
const completedCount = document.getElementById("completedCount");

const allBtn = document.getElementById("allBtn");
const activeBtn = document.getElementById("activeBtn");
const completedBtn = document.getElementById("completedBtn");

const themeBtn = document.getElementById("themeBtn");
const dateTime = document.getElementById("dateTime");
const weatherEl = document.getElementById("weather");
const weatherIcon = document.getElementById("weatherIcon");

/* ---------------- APP STATE ---------------- */
let tasks = JSON.parse(localStorage.getItem("tasks")) || []; // Load tasks from localStorage
let currentFilter = "all"; // "all" | "active" | "completed"

/* ---------------- UTILITIES ---------------- */

/**
 * Save tasks to localStorage
 */
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

/**
 * Generate a unique ID based on current timestamp
 * @returns {number}
 */
function generateId() {
  return Date.now();
}

/* ---------------- DATE & TIME ---------------- */

/**
 * Update the live date and time display
 */
function updateDateTime() {
  dateTime.textContent = new Date().toLocaleString();
}
setInterval(updateDateTime, 1000); // Update every second
updateDateTime(); // Initial call

/* ---------------- WEATHER ---------------- */

/**
 * Fetch and display current weather
 * Uses Open-Meteo API (latitude/longitude hardcoded to Porto, Portugal)
 */
function getWeather() {
  fetch(
    "https://api.open-meteo.com/v1/forecast?latitude=41.15&longitude=-8.61&current_weather=true"
  )
    .then(res => res.json())
    .then(data => {
      const temp = data.current_weather.temperature;
      const code = data.current_weather.weathercode;

      let icon = "https://img.icons8.com/fluency/96/partly-cloudy-day.png";
      let text = "Mild weather";

      if (code === 0) {
        icon = "https://img.icons8.com/fluency/96/sun.png";
        text = "Clear sky";
      } else if (code >= 61) {
        icon = "https://img.icons8.com/fluency/96/rain.png";
        text = "Rain";
      }

      weatherIcon.src = icon;
      weatherEl.textContent = `${text} — ${temp}°C`;
    })
    .catch(() => {
      weatherEl.textContent = "Weather unavailable";
    });
}
getWeather();

/* ---------------- RENDER TASKS ---------------- */

/**
 * Render tasks in the task list based on current filter
 */
function renderTasks() {
  taskList.innerHTML = ""; // Clear list

  // Filter tasks
  let filtered = tasks;
  if (currentFilter === "active") filtered = tasks.filter(t => !t.completed);
  if (currentFilter === "completed") filtered = tasks.filter(t => t.completed);

  filtered.forEach(task => {
    const li = document.createElement("li");
    if (task.completed) li.classList.add("completed");

    // Task text element
    const textSpan = document.createElement("span");
    textSpan.textContent = task.text;

    /**
     * Enter edit mode for a task
     */
    function enterEditMode() {
      const input = document.createElement("input");
      input.type = "text";
      input.value = task.text;

      // Save on Enter
      input.addEventListener("keydown", e => {
        if (e.key === "Enter") input.blur();
      });

      // Save on blur
      input.addEventListener("blur", () => {
        const newText = input.value.trim();
        if (newText) task.text = newText; // Update text if not empty
        saveTasks();
        renderTasks();
      });

      li.replaceChild(input, textSpan);
      input.focus();
    }

    // Double click to edit
    textSpan.addEventListener("dblclick", enterEditMode);

    // Complete button
    const completeBtn = document.createElement("button");
    completeBtn.textContent = "✔";
    completeBtn.title = task.completed ? "Mark as active" : "Mark as completed";
    completeBtn.onclick = () => {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
    };

    // Edit button
    const editBtn = document.createElement("button");
    editBtn.textContent = "✎";
    editBtn.title = "Edit task";
    editBtn.onclick = enterEditMode;

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "✖";
    deleteBtn.title = "Delete task";
    deleteBtn.onclick = () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      renderTasks();
    };

    li.append(textSpan, completeBtn, editBtn, deleteBtn);
    taskList.appendChild(li);
  });

  // Update counts
  activeCount.textContent = tasks.filter(t => !t.completed).length;
  completedCount.textContent = tasks.filter(t => t.completed).length;
}

/* ---------------- ADD TASK ---------------- */

taskForm.addEventListener("submit", e => {
  e.preventDefault();

  const taskText = taskInput.value.trim();
  if (!taskText) return; // Prevent empty task

  tasks.push({
    id: generateId(),
    text: taskText,
    completed: false,
  });

  taskInput.value = "";
  saveTasks();
  renderTasks();
});

/* ---------------- FILTERS ---------------- */

/**
 * Set the current filter and update the UI
 * @param {string} filter - "all", "active", "completed"
 */
function setFilter(filter) {
  currentFilter = filter;

  // Remove active class from all filter buttons
  document.querySelectorAll(".filters button").forEach(btn =>
    btn.classList.remove("active")
  );

  // Add active class to selected button
  document.getElementById(`${filter}Btn`).classList.add("active");

  renderTasks();
}

allBtn.onclick = () => setFilter("all");
activeBtn.onclick = () => setFilter("active");
completedBtn.onclick = () => setFilter("completed");

/* ---------------- THEME ---------------- */

// Toggle dark mode
themeBtn.onclick = () => {
  document.body.classList.toggle("dark");
};

/* ---------------- INIT ---------------- */

renderTasks();
