const API_URL = "/api/courses";
const STATUS_LABELS = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed"
};

const courseGrid = document.querySelector("#course-grid");
const courseDialog = document.querySelector("#course-dialog");
const courseForm = document.querySelector("#course-form");
const notice = document.querySelector("#notice");
const toast = document.querySelector("#toast");
const searchInput = document.querySelector("#search-input");
const statusFilter = document.querySelector("#status-filter");
const formError = document.querySelector("#form-error");
const courseIdInput = document.querySelector("#course-id");
const courseNameInput = document.querySelector("#course-name");
const courseDescriptionInput = document.querySelector("#course-description");
const courseDateInput = document.querySelector("#course-date");
const courseStatusInput = document.querySelector("#course-status");
const dialogTitle = document.querySelector("#dialog-title");
const saveCourseButton = document.querySelector("#save-course-button");
let courses = [];
let toastTimer;
let loadFailed = false;

document.querySelector("#today-label").textContent = new Intl.DateTimeFormat("en", {
  weekday: "short",
  month: "short",
  day: "numeric"
}).format(new Date());

function formatDate(dateString) {
  if (!dateString) return "No target date";
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function getStatusClass(status) {
  return ({
    NOT_STARTED: "status-not-started",
    IN_PROGRESS: "status-in-progress",
    COMPLETED: "status-completed"
  })[status] || "status-not-started";
}

function makeElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function setSaveButtonLabel(label) {
  const arrow = makeElement("span", "", "↗");
  arrow.setAttribute("aria-hidden", "true");
  saveCourseButton.replaceChildren(document.createTextNode(`${label} `), arrow);
}

function makeActionButton(label, symbol, className, action, course) {
  const button = makeElement("button", `icon-button ${className}`, symbol);
  button.type = "button";
  button.setAttribute("aria-label", `${label} ${course.name}`);
  button.title = label;
  button.addEventListener("click", () => action(course));
  return button;
}

function makeCourseCard(course) {
  const card = makeElement("article", "course-card");
  const top = makeElement("div", "card-top");
  const monogram = makeElement("span", "course-monogram", (course.name || "?").trim().charAt(0) || "?");
  monogram.setAttribute("aria-hidden", "true");
  const menu = makeElement("div", "card-menu");
  menu.append(
    makeActionButton("Edit", "✎", "edit-button", openEditDialog, course),
    makeActionButton("Delete", "×", "delete-button", deleteCourse, course)
  );
  top.append(monogram, menu);

  const title = makeElement("h3", "course-title", course.name || "Untitled course");
  const description = makeElement("p", "course-description", course.description || "A new learning journey starts here.");
  const footer = makeElement("div", "card-footer");
  const badge = makeElement("span", `status-badge ${getStatusClass(course.status)}`, STATUS_LABELS[course.status] || "Not started");
  const date = makeElement("span", "course-date", `Target ${formatDate(course.targetCompletionDate)}`);
  footer.append(badge, date);
  card.append(top, title, description, footer);
  return card;
}

function getFilteredCourses() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  const selectedStatus = statusFilter.value;
  return courses.filter((course) => {
    const matchesStatus = selectedStatus === "ALL" || course.status === selectedStatus;
    const searchableText = `${course.name || ""} ${course.description || ""}`.toLocaleLowerCase();
    return matchesStatus && searchableText.includes(query);
  });
}

function renderCourses() {
  const visibleCourses = getFilteredCourses();
  courseGrid.replaceChildren();
  document.querySelector("#visible-count").textContent = `(${visibleCourses.length})`;
  document.querySelector("#nav-course-count").textContent = String(courses.length);
  document.querySelector("#stat-total").textContent = String(courses.length);
  document.querySelector("#stat-progress").textContent = String(courses.filter((course) => course.status === "IN_PROGRESS").length);
  document.querySelector("#stat-completed").textContent = String(courses.filter((course) => course.status === "COMPLETED").length);

  if (visibleCourses.length) {
    courseGrid.append(...visibleCourses.map(makeCourseCard));
    return;
  }

  const empty = makeElement("div", "empty-state");
  const content = makeElement("div");
  const hasFilters = searchInput.value || statusFilter.value !== "ALL";
  const icon = makeElement("div", "empty-illustration", hasFilters ? "⌕" : loadFailed ? "!" : "✳");
  icon.setAttribute("aria-hidden", "true");
  const title = makeElement("h3", "", hasFilters ? "No courses found" : loadFailed ? "Courses couldn't load" : "Your learning starts here");
  const message = makeElement("p", "", hasFilters
    ? "Try a different search or choose another status filter."
    : loadFailed ? "Your courses will appear here once the connection is restored."
      : "Add your first course and make a little room to grow.");
  content.append(icon, title, message);
  if (!hasFilters && !loadFailed) {
    const addButton = makeElement("button", "button button-primary", "Add your first course");
    addButton.type = "button";
    addButton.addEventListener("click", openCreateDialog);
    content.append(addButton);
  }
  empty.append(content);
  courseGrid.append(empty);
}

function setNotice(message) {
  notice.textContent = message;
  notice.hidden = !message;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 3000);
}

async function readError(response) {
  const body = await response.text();
  if (!body) return `Request failed (${response.status}).`;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("html") || /^\s*<!doctype html/i.test(body)) {
    return `Request failed (${response.status}).`;
  }
  try {
    const data = JSON.parse(body);
    return data.message || data.detail || data.title || `Request failed (${response.status}).`;
  } catch {
    return body.slice(0, 240);
  }
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers
    }
  });
  if (!response.ok) throw new Error(await readError(response));
  if (response.status === 204) return null;
  return response.json();
}

async function loadCourses() {
  courseGrid.setAttribute("aria-busy", "true");
  setNotice("");
  try {
    const result = await apiRequest(API_URL);
    if (!Array.isArray(result)) throw new Error("The courses response was not a list.");
    courses = result;
    loadFailed = false;
    renderCourses();
  } catch (error) {
    courses = [];
    loadFailed = true;
    renderCourses();
    setNotice(`Could not load courses. ${error.message}`);
  } finally {
    courseGrid.setAttribute("aria-busy", "false");
  }
}

function openCreateDialog() {
  courseForm.reset();
  courseIdInput.value = "";
  dialogTitle.textContent = "Add a course";
  setSaveButtonLabel("Save course");
  courseStatusInput.value = "NOT_STARTED";
  formError.hidden = true;
  formError.textContent = "";
  courseDialog.showModal();
  courseNameInput.focus();
}

function openEditDialog(course) {
  courseForm.reset();
  courseIdInput.value = course.id;
  courseNameInput.value = course.name || "";
  courseDescriptionInput.value = course.description || "";
  courseDateInput.value = course.targetCompletionDate || "";
  courseStatusInput.value = course.status || "NOT_STARTED";
  dialogTitle.textContent = "Edit course";
  setSaveButtonLabel("Save changes");
  formError.hidden = true;
  formError.textContent = "";
  courseDialog.showModal();
  courseNameInput.focus();
}

async function deleteCourse(course) {
  const confirmed = window.confirm(`Delete "${course.name}"? This can't be undone.`);
  if (!confirmed) return;
  try {
    await apiRequest(`${API_URL}/${encodeURIComponent(course.id)}`, { method: "DELETE" });
    await loadCourses();
    showToast("Course deleted.");
  } catch (error) {
    setNotice(`Could not delete course. ${error.message}`);
  }
}

courseForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  formError.hidden = true;
  const id = courseIdInput.value;
  const payload = {
    name: courseNameInput.value.trim(),
    description: courseDescriptionInput.value.trim(),
    targetCompletionDate: courseDateInput.value,
    status: courseStatusInput.value
  };
  if (!payload.name) {
    formError.textContent = "Please enter a course name.";
    formError.hidden = false;
    courseNameInput.focus();
    return;
  }

  saveCourseButton.disabled = true;
  saveCourseButton.textContent = id ? "Saving…" : "Adding…";
  try {
    await apiRequest(id ? `${API_URL}/${encodeURIComponent(id)}` : API_URL, {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(payload)
    });
    courseDialog.close();
    await loadCourses();
    showToast(id ? "Your changes are saved." : "Course added to your library.");
  } catch (error) {
    formError.textContent = `Could not save course. ${error.message}`;
    formError.hidden = false;
  } finally {
    saveCourseButton.disabled = false;
    setSaveButtonLabel(id ? "Save changes" : "Save course");
  }
});

document.querySelector("#add-course-button").addEventListener("click", openCreateDialog);
document.querySelectorAll("[data-close-dialog]").forEach((button) => {
  button.addEventListener("click", () => courseDialog.close());
});
courseDialog.addEventListener("click", (event) => {
  if (event.target === courseDialog) courseDialog.close();
});
searchInput.addEventListener("input", renderCourses);
statusFilter.addEventListener("change", renderCourses);

loadCourses();
