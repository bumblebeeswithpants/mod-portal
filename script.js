const STORAGE_KEY = "modPortalState";
const CONTENT_KEY = "modPortalContent";
const SETTINGS_KEY = "modPortalSettings";

const defaultContent = {
  "portal.subtitle": "Training Center",
  "dashboard.title": "Welcome",
  "dashboard.description": "Training, messages, feedback, and portal updates.",
  "dashboard.quick.policies": "View handbook",
  "dashboard.quick.resources": "Open library",
  "dashboard.quick.settings": "Portal preferences",
  "training.title": "Training",
  "training.description": "View lessons, progress, and assessments.",
  "training.empty": "Choose a lesson to begin.",
  "grades.title": "Grades & Feedback",
  "grades.description": "View assessment results and mentor feedback.",
  "messages.title": "Messages",
  "messages.description": "Communicate with staff and mentors.",
  "notifications.title": "Notifications",
  "notifications.description": "View recent portal updates.",
  "policies.title": "Policies",
  "policies.description": "Browse staff policies and required reading.",
  "resources.title": "Resources",
  "resources.description": "Browse staff references and materials.",
  "staff.title": "Staff",
  "staff.description": "View the staff directory.",
  "onboarding.title": "Onboarding",
  "onboarding.description": "Complete required onboarding steps.",
  "mentor.title": "Mentor Tools",
  "mentor.description": "Review assigned cadets and training progress.",
  "submissions.title": "Submission Queue",
  "submissions.description": "Review pending training submissions.",
  "staffManagement.title": "Staff Management",
  "staffManagement.description": "Manage staff access, roles, and assignments.",
  "curriculum.title": "Curriculum",
  "curriculum.description": "Manage training lessons and assessments.",
  "onboardingManagement.title": "Onboarding Setup",
  "onboardingManagement.description": "Manage onboarding steps and requirements.",
  "restricted.title": "Restricted Records",
  "restricted.description": "View and manage restricted records.",
  "accounts.title": "Accounts",
  "accounts.description": "Manage portal account access.",
  "announcements.title": "Announcements",
  "announcements.description": "Create and manage portal announcements.",
  "audit.title": "Audit Log",
  "audit.description": "Review recorded portal actions.",
  "admin.title": "Admin Tools",
  "admin.description": "Manage portal-wide controls.",
  "admin.maintenance": "Control portal availability.",
  "admin.backup": "Manage portal backups.",
  "admin.permissions": "Review role and clearance access.",
  "admin.content": "Edit portal text and descriptions.",
  "profile.title": "Profile",
  "profile.description": "View your account and staff information.",
  "settings.title": "Settings",
  "settings.description": "Manage your portal preferences.",
  "settings.appearance.description": "Customize how the portal looks.",
  "settings.theme.description": "Choose the portal theme.",
  "settings.density.description": "Adjust spacing throughout the portal.",
  "settings.sidebar.description": "Choose how the sidebar behaves.",
  "settings.accessibility.description": "Adjust accessibility preferences.",
  "settings.motion.description": "Reduce interface animation.",
  "settings.contrast.description": "Increase interface contrast.",
  "settings.notifications.description": "Choose which portal updates you receive.",
  "settings.messages.description": "Manage message display preferences.",
  "settings.account.description": "Manage account and session options.",
  "settings.portal.description": "Manage portal-wide content settings.",
  "help.title": "Help",
  "help.description": "Browse portal help and guidance."
};

const defaultState = {
  currentUser: {
    id: "local-owner",
    displayName: "Portal User",
    username: "portaluser",
    initials: "MP",
    role: "Owner",
    clearance: 5,
    status: "Active",
    mentor: null,
    grade: null
  },

  lessons: [
    {
      id: "lesson-1",
      order: 1,
      title: "Lesson 01",
      description: "",
      content: "",
      status: "available",
      progress: 0,
      score: null,
      prerequisite: null,
      mentorUnlock: false
    },
    {
      id: "lesson-2",
      order: 2,
      title: "Lesson 02",
      description: "",
      content: "",
      status: "locked",
      progress: 0,
      score: null,
      prerequisite: "lesson-1",
      mentorUnlock: false
    },
    {
      id: "lesson-3",
      order: 3,
      title: "Lesson 03",
      description: "",
      content: "",
      status: "locked",
      progress: 0,
      score: null,
      prerequisite: "lesson-2",
      mentorUnlock: false
    },
    {
      id: "lesson-4",
      order: 4,
      title: "Lesson 04",
      description: "",
      content: "",
      status: "locked",
      progress: 0,
      score: null,
      prerequisite: "lesson-3",
      mentorUnlock: true
    }
  ],

  grades: [],

  messages: [],

  notifications: [],

  activity: [],

  feedback: [],

  notices: [],

  policies: [],

  resources: [],

  staff: [
    {
      id: "local-owner",
      displayName: "Portal User",
      username: "portaluser",
      initials: "MP",
      role: "Owner",
      clearance: 5,
      status: "active",
      mentor: null,
      description: ""
    }
  ],

  onboarding: [],

  submissions: [],

  restrictedRecords: [],

  announcements: [],

  audit: [],

  help: [],

  maintenanceMode: false
};

const defaultSettings = {
  theme: "light",
  density: "comfortable",
  sidebar: "expanded",
  reducedMotion: false,
  highContrast: false,
  notifyMessages: true,
  notifyTraining: true,
  notifyGrades: true,
  notifyPolicies: true,
  messagePreviews: true,
  contentEditing: false
};

let state = loadJSON(STORAGE_KEY, defaultState);
let content = loadJSON(CONTENT_KEY, defaultContent);
let settings = loadJSON(SETTINGS_KEY, defaultSettings);
let currentPage = "dashboard";
let currentConversationId = null;
let currentLessonId = null;
let currentMentorCadetId = null;
let currentCurriculumLessonId = null;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadJSON(key, fallback) {
  try {
    const saved = localStorage.getItem(key);

    if (!saved) {
      return clone(fallback);
    }

    return mergeDeep(clone(fallback), JSON.parse(saved));
  } catch {
    return clone(fallback);
  }
}

function mergeDeep(target, source) {
  if (!source || typeof source !== "object") {
    return target;
  }

  Object.keys(source).forEach((key) => {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === "object" &&
      !Array.isArray(target[key])
    ) {
      target[key] = mergeDeep(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  });

  return target;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function saveContent() {
  document.querySelectorAll("[data-content-key]").forEach((element) => {
    const key = element.dataset.contentKey;
    content[key] = element.textContent.trim();
  });

  localStorage.setItem(CONTENT_KEY, JSON.stringify(content));
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function uid(prefix = "item") {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function formatDateTime(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase() || "MP";
}

function userCan(minimum) {
  return Number(state.currentUser.clearance || 0) >= Number(minimum);
}

function addAudit(action, target = "", details = "") {
  state.audit.unshift({
    id: uid("audit"),
    time: new Date().toISOString(),
    user: state.currentUser.displayName,
    action,
    target,
    details
  });

  saveState();
}

function addActivity(title, description = "") {
  state.activity.unshift({
    id: uid("activity"),
    title,
    description,
    time: new Date().toISOString()
  });

  state.activity = state.activity.slice(0, 50);
  saveState();
}

function addNotification(title, description = "", type = "general") {
  state.notifications.unshift({
    id: uid("notification"),
    title,
    description,
    type,
    time: new Date().toISOString(),
    read: false
  });

  saveState();
  renderNotifications();
  updateCounts();
}

function toast(message) {
  const region = document.getElementById("toastRegion");

  if (!region) {
    return;
  }

  const item = document.createElement("div");
  item.className = "toast";
  item.textContent = message;

  region.appendChild(item);

  setTimeout(() => {
    item.remove();
  }, 3000);
}

function applyContent() {
  document.querySelectorAll("[data-content-key]").forEach((element) => {
    const key = element.dataset.contentKey;

    if (Object.prototype.hasOwnProperty.call(content, key)) {
      element.textContent = content[key];
    }
  });
}

function setContentEditing(enabled) {
  const allowed = userCan(5) && enabled;

  settings.contentEditing = allowed;

  document.querySelectorAll("[data-c5-edit]").forEach((element) => {
    if (allowed) {
      element.setAttribute("contenteditable", "true");
      element.setAttribute("spellcheck", "true");
    } else {
      element.removeAttribute("contenteditable");
      element.removeAttribute("spellcheck");
    }
  });

  const toggle = document.getElementById("contentEditToggle");

  if (toggle) {
    toggle.checked = allowed;
  }

  saveSettings();
}

function bindUser() {
  const user = state.currentUser;

  document.querySelectorAll("[data-user-name]").forEach((element) => {
    element.textContent = user.displayName;
  });

  document.querySelectorAll("[data-user-role]").forEach((element) => {
    element.textContent = user.role;
  });

  document.querySelectorAll("[data-user-avatar]").forEach((element) => {
    element.textContent = user.initials || getInitials(user.displayName);
  });

  document.querySelectorAll("[data-user-clearance]").forEach((element) => {
    element.textContent = `C${user.clearance}`;
  });

  document.querySelectorAll("[data-user-clearance-number]").forEach((element) => {
    element.textContent = user.clearance;
  });

  document.querySelectorAll("[data-user-status]").forEach((element) => {
    element.textContent = user.status || "Active";
  });

  document.querySelectorAll("[data-user-username]").forEach((element) => {
    element.textContent = user.username || "—";
  });

  document.querySelectorAll("[data-user-mentor]").forEach((element) => {
    element.textContent = user.mentor || "—";
  });

  document.querySelectorAll("[data-user-grade]").forEach((element) => {
    element.textContent = user.grade ?? calculateGradeAverage() ?? "—";
  });
}

function applyClearance() {
  document.querySelectorAll("[data-clearance-min]").forEach((element) => {
    const minimum = Number(element.dataset.clearanceMin);

    element.hidden = !userCan(minimum);
  });

  if (!userCan(5)) {
    settings.contentEditing = false;
    saveSettings();
  }

  setContentEditing(settings.contentEditing);
}

function applyTheme() {
  const root = document.documentElement;
  let theme = settings.theme;

  if (theme === "system") {
    theme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  root.dataset.theme = theme;
  root.dataset.density = settings.density;
  root.dataset.reducedMotion = String(settings.reducedMotion);
  root.dataset.contrast = settings.highContrast ? "high" : "normal";

  document.body.classList.remove("sidebar-collapsed");

  if (
    settings.sidebar === "collapsed" ||
    (
      settings.sidebar === "auto" &&
      window.innerWidth > 920 &&
      window.innerWidth < 1200
    )
  ) {
    document.body.classList.add("sidebar-collapsed");
  }

  const themeSelect = document.getElementById("themeSelect");
  const densitySelect = document.getElementById("densitySelect");
  const sidebarPreference = document.getElementById("sidebarPreference");
  const reducedMotionToggle = document.getElementById("reducedMotionToggle");
  const highContrastToggle = document.getElementById("highContrastToggle");
  const notifyMessages = document.getElementById("notifyMessages");
  const notifyTraining = document.getElementById("notifyTraining");
  const notifyGrades = document.getElementById("notifyGrades");
  const notifyPolicies = document.getElementById("notifyPolicies");
  const messagePreviewToggle = document.getElementById("messagePreviewToggle");

  if (themeSelect) themeSelect.value = settings.theme;
  if (densitySelect) densitySelect.value = settings.density;
  if (sidebarPreference) sidebarPreference.value = settings.sidebar;
  if (reducedMotionToggle) reducedMotionToggle.checked = settings.reducedMotion;
  if (highContrastToggle) highContrastToggle.checked = settings.highContrast;
  if (notifyMessages) notifyMessages.checked = settings.notifyMessages;
  if (notifyTraining) notifyTraining.checked = settings.notifyTraining;
  if (notifyGrades) notifyGrades.checked = settings.notifyGrades;
  if (notifyPolicies) notifyPolicies.checked = settings.notifyPolicies;
  if (messagePreviewToggle) messagePreviewToggle.checked = settings.messagePreviews;
}

function navigateTo(pageName) {
  const target = document.querySelector(`[data-page="${pageName}"]`);

  if (!target) {
    return;
  }

  const minimum = Number(target.dataset.clearanceMin || 0);

  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active");
  });

  if (!userCan(minimum)) {
    document.getElementById("permissionDenied")?.classList.add("active");
    currentPage = "permissionDenied";
  } else {
    target.classList.add("active");
    currentPage = pageName;
  }

  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.pageTarget === pageName
    );
  });

  history.replaceState(null, "", `#${pageName}`);

  document.body.classList.remove("mobile-sidebar-open");

  window.scrollTo({
    top: 0,
    behavior: settings.reducedMotion ? "auto" : "smooth"
  });

  renderPage(pageName);
}

function renderPage(pageName) {
  if (pageName === "dashboard") renderDashboard();
  if (pageName === "training") renderTraining();
  if (pageName === "grades") renderGrades();
  if (pageName === "messages") renderMessages();
  if (pageName === "notifications") renderNotifications();
  if (pageName === "policies") renderPolicies();
  if (pageName === "resources") renderResources();
  if (pageName === "staff") renderStaff();
  if (pageName === "onboarding") renderOnboarding();
  if (pageName === "mentor") renderMentor();
  if (pageName === "submissions") renderSubmissions();
  if (pageName === "staff-management") renderStaffManagement();
  if (pageName === "curriculum") renderCurriculum();
  if (pageName === "onboarding-management") renderOnboardingManagement();
  if (pageName === "restricted-records") renderRestrictedRecords();
  if (pageName === "accounts") renderAccounts();
  if (pageName === "announcements") renderAnnouncements();
  if (pageName === "audit-log") renderAudit();
  if (pageName === "profile") bindUser();
  if (pageName === "help") renderHelp();
}

function calculateTrainingProgress() {
  if (!state.lessons.length) {
    return 0;
  }

  const total = state.lessons.reduce(
    (sum, lesson) => sum + Number(lesson.progress || 0),
    0
  );

  return Math.round(total / state.lessons.length);
}

function calculateGradeAverage() {
  const scored = state.grades.filter(
    (grade) => typeof grade.score === "number"
  );

  if (!scored.length) {
    return null;
  }

  return Math.round(
    scored.reduce((sum, grade) => sum + grade.score, 0) / scored.length
  );
}

function getCurrentLesson() {
  return state.lessons
    .slice()
    .sort((a, b) => a.order - b.order)
    .find((lesson) => lesson.status !== "locked" && lesson.progress < 100);
}

function renderDashboard() {
  const progress = calculateTrainingProgress();
  const currentLesson = getCurrentLesson();

  const progressText = document.querySelector("[data-training-progress]");
  const progressBar = document.querySelector("[data-training-progress-bar]");
  const currentLessonTitle = document.querySelector("[data-current-lesson-title]");
  const currentLessonAction = document.querySelector("[data-current-lesson-action]");

  if (progressText) {
    progressText.textContent = `${progress}%`;
  }

  if (progressBar) {
    progressBar.style.width = `${progress}%`;
  }

  if (currentLessonTitle) {
    currentLessonTitle.textContent = currentLesson?.title || "None";
  }

  if (currentLessonAction) {
    currentLessonAction.disabled = !currentLesson;
    currentLessonAction.onclick = () => {
      if (!currentLesson) {
        return;
      }

      currentLessonId = currentLesson.id;
      navigateTo("training");
    };
  }

  renderActivity();
  renderFeedback();
  renderAssignedMentor();
  renderNotices();
  bindUser();
}

function renderActivity() {
  const list = document.getElementById("recentActivity");

  if (!list) {
    return;
  }

  if (!state.activity.length) {
    list.innerHTML = `
      <div class="empty-state">
        <span>—</span>
        <p>No recent activity.</p>
      </div>
    `;
    return;
  }

  list.innerHTML = state.activity
    .slice(0, 6)
    .map(
      (item) => `
        <div class="activity-item">
          <span class="activity-icon">•</span>
          <div>
            <strong>${escapeHTML(item.title)}</strong>
            ${item.description ? `<p>${escapeHTML(item.description)}</p>` : ""}
            <time>${escapeHTML(formatDateTime(item.time))}</time>
          </div>
        </div>
      `
    )
    .join("");
}

function renderFeedback() {
  const list = document.getElementById("recentFeedback");

  if (!list) {
    return;
  }

  if (!state.feedback.length) {
    list.innerHTML = `
      <div class="empty-state">
        <span>—</span>
        <p>No recent feedback.</p>
      </div>
    `;
    return;
  }

  list.innerHTML = state.feedback
    .slice(0, 4)
    .map(
      (item) => `
        <div class="feedback-item">
          <div>
            <strong>${escapeHTML(item.title || "Feedback")}</strong>
            <p>${escapeHTML(item.body || "")}</p>
            <time>${escapeHTML(formatDateTime(item.time))}</time>
          </div>
        </div>
      `
    )
    .join("");
}

function renderAssignedMentor() {
  const container = document.getElementById("assignedMentor");

  if (!container) {
    return;
  }

  const mentor = state.staff.find(
    (member) =>
      member.id === state.currentUser.mentor ||
      member.displayName === state.currentUser.mentor
  );

  if (!mentor) {
    container.innerHTML = `
      <div class="empty-state compact">
        <p>No mentor assigned.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <button class="mentor-cadet-item" type="button" data-staff-id="${mentor.id}">
      <strong>${escapeHTML(mentor.displayName)}</strong>
      <span>${escapeHTML(mentor.role)}</span>
    </button>
  `;
}

function renderNotices() {
  const container = document.getElementById("dashboardNotices");

  if (!container) {
    return;
  }

  const notices = [
    ...state.notices,
    ...state.announcements.filter((announcement) => announcement.pinned)
  ];

  if (!notices.length) {
    container.innerHTML = `
      <div class="empty-state compact">
        <p>No notices.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = notices
    .slice(0, 4)
    .map(
      (notice) => `
        <div class="notification-item">
          <div>
            <strong>${escapeHTML(notice.title)}</strong>
            ${notice.description ? `<p>${escapeHTML(notice.description)}</p>` : ""}
          </div>
        </div>
      `
    )
    .join("");
}

function renderTraining() {
  const list = document.getElementById("lessonList");

  if (!list) {
    return;
  }

  const lessons = state.lessons
    .slice()
    .sort((a, b) => a.order - b.order);

  list.innerHTML = lessons
    .map(
      (lesson) => `
        <button
          type="button"
          class="${lesson.id === currentLessonId ? "active" : ""}"
          data-open-lesson="${lesson.id}"
          ${lesson.status === "locked" ? "disabled" : ""}
        >
          <strong>${escapeHTML(lesson.title)}</strong>
          <span>${escapeHTML(
            lesson.status === "locked"
              ? "Locked"
              : `${lesson.progress || 0}%`
          )}</span>
        </button>
      `
    )
    .join("");

  if (!currentLessonId) {
    const current = getCurrentLesson();
    currentLessonId = current?.id || null;
  }

  renderLessonView(currentLessonId);
}

function renderLessonView(id) {
  const container = document.getElementById("lessonView");

  if (!container) {
    return;
  }

  const lesson = state.lessons.find((item) => item.id === id);

  if (!lesson) {
    container.innerHTML = `
      <div class="empty-state large">
        <span>▤</span>
        <h2>Select a lesson</h2>
        <p>${escapeHTML(content["training.empty"] || "")}</p>
      </div>
    `;
    return;
  }

  if (lesson.status === "locked") {
    container.innerHTML = `
      <div class="empty-state large">
        <span>×</span>
        <h2>${escapeHTML(lesson.title)}</h2>
        <p>Locked.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="panel-head">
      <div>
        <span class="panel-label">Lesson ${escapeHTML(String(lesson.order))}</span>
        <h2>${escapeHTML(lesson.title)}</h2>
      </div>
      <span class="status ${lesson.progress >= 100 ? "success" : ""}">
        ${escapeHTML(`${lesson.progress || 0}%`)}
      </span>
    </div>

    ${
      lesson.description
        ? `<p>${escapeHTML(lesson.description)}</p>`
        : ""
    }

    <div class="lesson-content">
      ${
        lesson.content
          ? lesson.content
          : `<div class="empty-state"><p>No lesson content yet.</p></div>`
      }
    </div>

    <div class="setting-actions">
      ${
        userCan(4)
          ? `<button class="secondary-action" type="button" data-edit-lesson="${lesson.id}">Edit Lesson</button>`
          : ""
      }
      ${
        lesson.progress < 100
          ? `<button class="primary-action" type="button" data-complete-lesson="${lesson.id}">Mark Complete</button>`
          : ""
      }
    </div>
  `;
}

function completeLesson(id) {
  const lesson = state.lessons.find((item) => item.id === id);

  if (!lesson || lesson.status === "locked") {
    return;
  }

  lesson.progress = 100;
  lesson.status = "complete";

  const nextLesson = state.lessons
    .slice()
    .sort((a, b) => a.order - b.order)
    .find((item) => item.prerequisite === lesson.id);

  if (nextLesson && !nextLesson.mentorUnlock) {
    nextLesson.status = "available";
  }

  addActivity(`${lesson.title} completed`);
  addNotification(`${lesson.title} completed`, "", "training");
  addAudit("Completed lesson", lesson.title);

  saveState();
  renderTraining();
  renderDashboard();
}

function renderGrades() {
  const average = calculateGradeAverage();
  const completed = state.grades.filter(
    (item) => item.status === "complete"
  ).length;
  const pending = state.grades.filter(
    (item) => item.status === "pending"
  ).length;

  const averageElement = document.querySelector("[data-grade-average]");
  const completedElement = document.querySelector("[data-grade-completed]");
  const pendingElement = document.querySelector("[data-grade-pending]");
  const feedbackElement = document.querySelector("[data-feedback-count]");

  if (averageElement) averageElement.textContent = average === null ? "—" : `${average}%`;
  if (completedElement) completedElement.textContent = completed;
  if (pendingElement) pendingElement.textContent = pending;
  if (feedbackElement) feedbackElement.textContent = state.feedback.length;

  const body = document.getElementById("gradeTable");
  const empty = document.getElementById("gradeEmpty");

  if (!body) {
    return;
  }

  body.innerHTML = state.grades
    .map(
      (grade) => `
        <tr>
          <td>${escapeHTML(grade.title)}</td>
          <td>
            <span class="status ${
              grade.status === "complete"
                ? "success"
                : grade.status === "pending"
                  ? "warning"
                  : ""
            }">
              ${escapeHTML(grade.status)}
            </span>
          </td>
          <td>${typeof grade.score === "number" ? `${grade.score}%` : "—"}</td>
          <td>${escapeHTML(grade.reviewer || "—")}</td>
          <td>
            ${
              grade.feedback
                ? `<button class="text-action" type="button" data-view-grade="${grade.id}">View</button>`
                : ""
            }
          </td>
        </tr>
      `
    )
    .join("");

  if (empty) {
    empty.hidden = state.grades.length > 0;
  }

  state.currentUser.grade = average;
  saveState();
  bindUser();
}

function renderMessages() {
  const list = document.getElementById("messageThreadList");

  if (!list) {
    return;
  }

  const query = document
    .getElementById("messageSearch")
    ?.value.trim()
    .toLowerCase() || "";

  const filtered = state.messages.filter((thread) =>
    String(thread.name || "").toLowerCase().includes(query)
  );

  list.innerHTML = filtered
    .map((thread) => {
      const last = thread.messages?.at(-1);

      return `
        <button
          type="button"
          class="message-thread ${thread.id === currentConversationId ? "active" : ""}"
          data-thread-id="${thread.id}"
        >
          <span class="avatar">${escapeHTML(thread.initials || getInitials(thread.name))}</span>

          <div>
            <strong>${escapeHTML(thread.name)}</strong>
            <span>${
              settings.messagePreviews
                ? escapeHTML(last?.body || "")
                : "Message"
            }</span>
          </div>

          ${
            thread.unread
              ? `<span class="nav-count">${thread.unread}</span>`
              : ""
          }
        </button>
      `;
    })
    .join("");

  if (!currentConversationId && filtered.length) {
    currentConversationId = filtered[0].id;
  }

  renderConversation(currentConversationId);
}

function renderConversation(id) {
  const empty = document.getElementById("conversationEmpty");
  const conversation = document.getElementById("conversation");
  const thread = state.messages.find((item) => item.id === id);

  if (!conversation || !empty) {
    return;
  }

  if (!thread) {
    conversation.hidden = true;
    empty.hidden = false;
    return;
  }

  empty.hidden = true;
  conversation.hidden = false;

  const name = conversation.querySelector("[data-conversation-name]");
  const role = conversation.querySelector("[data-conversation-role]");
  const avatar = conversation.querySelector("[data-conversation-avatar]");
  const messages = document.getElementById("conversationMessages");

  if (name) name.textContent = thread.name;
  if (role) role.textContent = thread.role || "";
  if (avatar) avatar.textContent = thread.initials || getInitials(thread.name);

  if (messages) {
    messages.innerHTML = (thread.messages || [])
      .map(
        (message) => `
          <div class="chat-bubble ${message.sender === "self" ? "sent" : ""}">
            <p>${escapeHTML(message.body)}</p>
            <time>${escapeHTML(formatDateTime(message.time))}</time>
          </div>
        `
      )
      .join("");

    messages.scrollTop = messages.scrollHeight;
  }

  thread.unread = 0;
  saveState();
  updateCounts();
}

function sendMessage(body) {
  const thread = state.messages.find(
    (item) => item.id === currentConversationId
  );

  if (!thread || !body.trim()) {
    return;
  }

  thread.messages ||= [];

  thread.messages.push({
    id: uid("message"),
    sender: "self",
    body: body.trim(),
    time: new Date().toISOString()
  });

  saveState();
  renderConversation(thread.id);
  renderMessages();
}

function openNewMessageModal() {
  const recipients = state.staff.filter(
    (member) => member.id !== state.currentUser.id
  );

  openModal(
    "New Message",
    `
      <div class="form-grid">
        <div class="form-row">
          <label>Recipient</label>
          <select id="newMessageRecipient">
            <option value="">Select staff</option>
            ${recipients
              .map(
                (member) => `
                  <option value="${member.id}">
                    ${escapeHTML(member.displayName)}
                  </option>
                `
              )
              .join("")}
          </select>
        </div>

        <div class="form-row">
          <label>Message</label>
          <textarea id="newMessageBody"></textarea>
        </div>
      </div>
    `,
    `
      <button class="secondary-action" type="button" data-close-modal>Cancel</button>
      <button class="primary-action" type="button" id="sendNewMessage">Send</button>
    `
  );

  document.getElementById("sendNewMessage")?.addEventListener("click", () => {
    const recipientId = document.getElementById("newMessageRecipient")?.value;
    const body = document.getElementById("newMessageBody")?.value.trim();
    const recipient = state.staff.find((member) => member.id === recipientId);

    if (!recipient || !body) {
      return;
    }

    let thread = state.messages.find(
      (item) => item.staffId === recipient.id
    );

    if (!thread) {
      thread = {
        id: uid("thread"),
        staffId: recipient.id,
        name: recipient.displayName,
        initials: recipient.initials,
        role: recipient.role,
        unread: 0,
        messages: []
      };

      state.messages.unshift(thread);
    }

    thread.messages.push({
      id: uid("message"),
      sender: "self",
      body,
      time: new Date().toISOString()
    });

    currentConversationId = thread.id;

    saveState();
    closeModal();
    navigateTo("messages");
    renderMessages();
  });
}

function renderNotifications() {
  const pageList = document.getElementById("notificationList");
  const drawerList = document.getElementById("notificationDrawerList");
  const empty = document.getElementById("notificationEmpty");

  const markup = state.notifications
    .map(
      (item) => `
        <button
          type="button"
          class="notification-item"
          data-notification-id="${item.id}"
        >
          <span class="notification-icon">${item.read ? "○" : "•"}</span>

          <div>
            <strong>${escapeHTML(item.title)}</strong>
            ${item.description ? `<p>${escapeHTML(item.description)}</p>` : ""}
            <time>${escapeHTML(formatDateTime(item.time))}</time>
          </div>
        </button>
      `
    )
    .join("");

  if (pageList) pageList.innerHTML = markup;
  if (drawerList) drawerList.innerHTML = markup;
  if (empty) empty.hidden = state.notifications.length > 0;

  updateCounts();
}

function markNotificationRead(id) {
  const notification = state.notifications.find((item) => item.id === id);

  if (!notification) {
    return;
  }

  notification.read = true;
  saveState();
  renderNotifications();
}

function markAllNotificationsRead() {
  state.notifications.forEach((item) => {
    item.read = true;
  });

  saveState();
  renderNotifications();
}

function updateCounts() {
  const unreadMessages = state.messages.reduce(
    (sum, thread) => sum + Number(thread.unread || 0),
    0
  );

  const unreadNotifications = state.notifications.filter(
    (item) => !item.read
  ).length;

  const pendingSubmissions = state.submissions.filter(
    (item) => item.status === "pending"
  ).length;

  document.querySelectorAll("[data-message-count]").forEach((element) => {
    element.textContent = unreadMessages;
    element.hidden = unreadMessages === 0;
  });

  document.querySelectorAll("[data-notification-count]").forEach((element) => {
    element.textContent = unreadNotifications;
    element.hidden = unreadNotifications === 0;
  });

  document.querySelectorAll("[data-submission-count]").forEach((element) => {
    element.textContent = pendingSubmissions;
    element.hidden = pendingSubmissions === 0;
  });

  document.querySelectorAll("[data-message-indicator]").forEach((element) => {
    element.hidden = unreadMessages === 0;
  });

  document.querySelectorAll("[data-notification-indicator]").forEach((element) => {
    element.hidden = unreadNotifications === 0;
  });

  document.querySelectorAll("[data-message-summary]").forEach((element) => {
    element.textContent = `${unreadMessages} unread`;
  });
}

function renderPolicies() {
  const grid = document.getElementById("policyGrid");
  const empty = document.getElementById("policyEmpty");
  const search = document.getElementById("policySearch")?.value.toLowerCase() || "";
  const category = document.getElementById("policyCategoryFilter")?.value || "";

  if (!grid) {
    return;
  }

  const categories = [...new Set(state.policies.map((item) => item.category).filter(Boolean))];
  fillSelect("policyCategoryFilter", categories, "All Categories");

  const items = state.policies.filter((policy) => {
    const matchesSearch =
      policy.title.toLowerCase().includes(search) ||
      String(policy.description || "").toLowerCase().includes(search);

    const matchesCategory = !category || policy.category === category;

    return matchesSearch && matchesCategory;
  });

  grid.innerHTML = items
    .map(
      (policy) => `
        <article class="library-card">
          <h3>${escapeHTML(policy.title)}</h3>
          ${policy.description ? `<p>${escapeHTML(policy.description)}</p>` : ""}

          <div class="library-card-footer">
            <span class="tag">${escapeHTML(policy.category || "Policy")}</span>

            <div>
              <button class="text-action" type="button" data-view-policy="${policy.id}">
                View
              </button>

              ${
                userCan(5)
                  ? `<button class="text-action" type="button" data-edit-policy="${policy.id}">Edit</button>`
                  : ""
              }
            </div>
          </div>
        </article>
      `
    )
    .join("");

  if (empty) {
    empty.hidden = items.length > 0;
  }
}

function renderResources() {
  const grid = document.getElementById("resourceGrid");
  const empty = document.getElementById("resourceEmpty");
  const search = document.getElementById("resourceSearch")?.value.toLowerCase() || "";
  const category = document.getElementById("resourceCategoryFilter")?.value || "";

  if (!grid) {
    return;
  }

  const categories = [...new Set(state.resources.map((item) => item.category).filter(Boolean))];
  fillSelect("resourceCategoryFilter", categories, "All Categories");

  const items = state.resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(search) ||
      String(resource.description || "").toLowerCase().includes(search);

    const matchesCategory = !category || resource.category === category;

    return matchesSearch && matchesCategory;
  });

  grid.innerHTML = items
    .map(
      (resource) => `
        <article class="library-card">
          <h3>${escapeHTML(resource.title)}</h3>
          ${resource.description ? `<p>${escapeHTML(resource.description)}</p>` : ""}

          <div class="library-card-footer">
            <span class="tag">${escapeHTML(resource.category || "Resource")}</span>

            <div>
              ${
                resource.url
                  ? `<a class="text-action" href="${escapeHTML(resource.url)}" target="_blank" rel="noopener">Open</a>`
                  : ""
              }

              ${
                userCan(5)
                  ? `<button class="text-action" type="button" data-edit-resource="${resource.id}">Edit</button>`
                  : ""
              }
            </div>
          </div>
        </article>
      `
    )
    .join("");

  if (empty) {
    empty.hidden = items.length > 0;
  }
}

function fillSelect(id, values, firstLabel) {
  const select = document.getElementById(id);

  if (!select) {
    return;
  }

  const current = select.value;

  select.innerHTML = `
    <option value="">${escapeHTML(firstLabel)}</option>
    ${values
      .map(
        (value) => `
          <option value="${escapeHTML(value)}">${escapeHTML(value)}</option>
        `
      )
      .join("")}
  `;

  if ([...select.options].some((option) => option.value === current)) {
    select.value = current;
  }
}

function renderStaff() {
  const grid = document.getElementById("staffGrid");
  const empty = document.getElementById("staffEmpty");
  const search = document.getElementById("staffSearch")?.value.toLowerCase() || "";
  const role = document.getElementById("staffRoleFilter")?.value || "";

  if (!grid) {
    return;
  }

  const roles = [...new Set(state.staff.map((item) => item.role).filter(Boolean))];
  fillSelect("staffRoleFilter", roles, "All Roles");

  const people = state.staff.filter((member) => {
    const matchesSearch =
      member.displayName.toLowerCase().includes(search) ||
      String(member.username || "").toLowerCase().includes(search);

    const matchesRole = !role || member.role === role;

    return matchesSearch && matchesRole;
  });

  grid.innerHTML = people
    .map(
      (member) => `
        <article class="staff-card">
          <span class="avatar">${escapeHTML(member.initials || getInitials(member.displayName))}</span>
          <h3>${escapeHTML(member.displayName)}</h3>
          <p>${escapeHTML(member.role)} · C${escapeHTML(String(member.clearance))}</p>

          ${member.description ? `<p>${escapeHTML(member.description)}</p>` : ""}

          <div class="staff-card-footer">
            <span class="status ${member.status === "active" ? "success" : ""}">
              ${escapeHTML(member.status)}
            </span>

            ${
              member.id !== state.currentUser.id
                ? `<button class="text-action" type="button" data-message-staff="${member.id}">Message</button>`
                : ""
            }
          </div>
        </article>
      `
    )
    .join("");

  if (empty) {
    empty.hidden = people.length > 0;
  }
}

function renderOnboarding() {
  const checklist = document.getElementById("onboardingChecklist");
  const progressText = document.querySelector("[data-onboarding-progress]");
  const progressBar = document.querySelector("[data-onboarding-progress-bar]");

  if (!checklist) {
    return;
  }

  const completed = state.onboarding.filter((item) => item.completed).length;
  const progress = state.onboarding.length
    ? Math.round((completed / state.onboarding.length) * 100)
    : 0;

  if (progressText) progressText.textContent = `${progress}%`;
  if (progressBar) progressBar.style.width = `${progress}%`;

  if (!state.onboarding.length) {
    checklist.innerHTML = `
      <div class="empty-state">
        <p>No onboarding steps.</p>
      </div>
    `;
    return;
  }

  checklist.innerHTML = state.onboarding
    .sort((a, b) => a.order - b.order)
    .map(
      (item) => `
        <label class="checklist-item">
          <input
            type="checkbox"
            data-onboarding-check="${item.id}"
            ${item.completed ? "checked" : ""}
            ${item.required && item.locked ? "disabled" : ""}
          >

          <div>
            <strong>${escapeHTML(item.title)}</strong>
            ${item.description ? `<p>${escapeHTML(item.description)}</p>` : ""}
          </div>
        </label>
      `
    )
    .join("");
}

function renderMentor() {
  const list = document.getElementById("mentorCadetList");
  const detail = document.getElementById("mentorCadetDetail");

  if (!list || !detail) {
    return;
  }

  const cadets = state.staff.filter(
    (member) =>
      Number(member.clearance) === 1 &&
      (
        member.mentor === state.currentUser.id ||
        member.mentor === state.currentUser.displayName
      )
  );

  const cadetCount = document.querySelector("[data-mentor-cadet-count]");
  const reviewCount = document.querySelector("[data-mentor-review-count]");
  const messageCount = document.querySelector("[data-mentor-message-count]");

  if (cadetCount) cadetCount.textContent = cadets.length;
  if (reviewCount) {
    reviewCount.textContent = state.submissions.filter(
      (item) => item.status === "pending"
    ).length;
  }
  if (messageCount) {
    messageCount.textContent = state.messages.reduce(
      (sum, thread) => sum + Number(thread.unread || 0),
      0
    );
  }

  if (!cadets.length) {
    list.innerHTML = `<div class="empty-state"><p>No assigned cadets.</p></div>`;
    detail.innerHTML = `<div class="empty-state"><p>Select a cadet.</p></div>`;
    return;
  }

  list.innerHTML = cadets
    .map(
      (member) => `
        <button
          type="button"
          class="mentor-cadet-item ${member.id === currentMentorCadetId ? "active" : ""}"
          data-mentor-cadet="${member.id}"
        >
          <strong>${escapeHTML(member.displayName)}</strong>
          <span>C${member.clearance}</span>
        </button>
      `
    )
    .join("");

  if (!currentMentorCadetId) {
    currentMentorCadetId = cadets[0].id;
  }

  const selected = cadets.find(
    (member) => member.id === currentMentorCadetId
  );

  if (!selected) {
    return;
  }

  detail.innerHTML = `
    <div class="profile-summary">
      <span class="avatar large">${escapeHTML(selected.initials || getInitials(selected.displayName))}</span>
      <div>
        <strong>${escapeHTML(selected.displayName)}</strong>
        <span>${escapeHTML(selected.role)}</span>
      </div>
    </div>

    <div class="setting-actions">
      <button class="secondary-action" type="button" data-message-staff="${selected.id}">
        Message
      </button>

      <button class="secondary-action" type="button" data-manage-cadet="${selected.id}">
        Training Access
      </button>
    </div>
  `;
}

function renderSubmissions() {
  const body = document.getElementById("submissionTable");
  const empty = document.getElementById("submissionEmpty");

  if (!body) {
    return;
  }

  body.innerHTML = state.submissions
    .map(
      (item) => `
        <tr>
          <td>${escapeHTML(item.staffName || "—")}</td>
          <td>${escapeHTML(item.title)}</td>
          <td>${escapeHTML(formatDateTime(item.submitted))}</td>
          <td>
            <span class="status ${item.status === "pending" ? "warning" : "success"}">
              ${escapeHTML(item.status)}
            </span>
          </td>
          <td>
            <button class="text-action" type="button" data-review-submission="${item.id}">
              Review
            </button>
          </td>
        </tr>
      `
    )
    .join("");

  if (empty) {
    empty.hidden = state.submissions.length > 0;
  }
}

function renderStaffManagement() {
  const body = document.getElementById("staffManagementTable");

  if (!body) {
    return;
  }

  const search = document
    .getElementById("staffManagementSearch")
    ?.value.toLowerCase() || "";

  const status = document.getElementById("staffManagementStatus")?.value || "";

  const staff = state.staff.filter((member) => {
    const matchesSearch =
      member.displayName.toLowerCase().includes(search) ||
      String(member.username || "").toLowerCase().includes(search);

    const matchesStatus = !status || member.status === status;

    return matchesSearch && matchesStatus;
  });

  body.innerHTML = staff
    .map(
      (member) => `
        <tr>
          <td>${escapeHTML(member.displayName)}</td>
          <td>${escapeHTML(member.role)}</td>
          <td>C${escapeHTML(String(member.clearance))}</td>
          <td>${escapeHTML(findMentorName(member.mentor))}</td>
          <td>
            <span class="status ${
              member.status === "active"
                ? "success"
                : member.status === "suspended"
                  ? "danger"
                  : "warning"
            }">
              ${escapeHTML(member.status)}
            </span>
          </td>
          <td>
            ${
              userCan(5) || Number(member.clearance) < state.currentUser.clearance
                ? `<button class="text-action" type="button" data-edit-staff="${member.id}">Manage</button>`
                : ""
            }
          </td>
        </tr>
      `
    )
    .join("");
}

function findMentorName(value) {
  if (!value) {
    return "—";
  }

  const mentor = state.staff.find(
    (member) => member.id === value || member.displayName === value
  );

  return mentor?.displayName || value;
}

function renderCurriculum() {
  const list = document.getElementById("curriculumLessonList");
  const editor = document.getElementById("curriculumEditor");

  if (!list || !editor) {
    return;
  }

  const lessons = state.lessons
    .slice()
    .sort((a, b) => a.order - b.order);

  list.innerHTML = lessons
    .map(
      (lesson) => `
        <button
          type="button"
          class="curriculum-item ${lesson.id === currentCurriculumLessonId ? "active" : ""}"
          data-curriculum-lesson="${lesson.id}"
        >
          <strong>${escapeHTML(lesson.title)}</strong>
          <span>${escapeHTML(lesson.status)}</span>
        </button>
      `
    )
    .join("");

  if (!currentCurriculumLessonId && lessons.length) {
    currentCurriculumLessonId = lessons[0].id;
  }

  const selected = state.lessons.find(
    (lesson) => lesson.id === currentCurriculumLessonId
  );

  if (!selected) {
    editor.innerHTML = `<div class="empty-state"><p>Select a lesson.</p></div>`;
    return;
  }

  editor.innerHTML = `
    <div class="form-grid">
      <div class="form-row">
        <label>Title</label>
        <input id="curriculumTitle" type="text" value="${escapeHTML(selected.title)}">
      </div>

      <div class="form-row">
        <label>Description</label>
        <textarea id="curriculumDescription">${escapeHTML(selected.description || "")}</textarea>
      </div>

      <div class="form-row">
        <label>Content</label>
        <textarea id="curriculumContent">${escapeHTML(selected.content || "")}</textarea>
      </div>

      <div class="form-row">
        <label>Status</label>
        <select id="curriculumStatus">
          <option value="available" ${selected.status === "available" ? "selected" : ""}>Available</option>
          <option value="locked" ${selected.status === "locked" ? "selected" : ""}>Locked</option>
          <option value="complete" ${selected.status === "complete" ? "selected" : ""}>Complete</option>
        </select>
      </div>

      <div class="setting-actions">
        <button class="primary-action" type="button" data-save-curriculum="${selected.id}">
          Save
        </button>

        <button class="danger-action" type="button" data-delete-lesson="${selected.id}">
          Delete
        </button>
      </div>
    </div>
  `;
}

function renderOnboardingManagement() {
  const container = document.getElementById("onboardingManagementList");

  if (!container) {
    return;
  }

  if (!state.onboarding.length) {
    container.innerHTML = `<div class="empty-state"><p>No onboarding steps.</p></div>`;
    return;
  }

  container.innerHTML = state.onboarding
    .sort((a, b) => a.order - b.order)
    .map(
      (item) => `
        <div class="checklist-item">
          <div>
            <strong>${escapeHTML(item.title)}</strong>
            ${item.description ? `<p>${escapeHTML(item.description)}</p>` : ""}
          </div>

          <button class="text-action" type="button" data-edit-onboarding="${item.id}">
            Edit
          </button>
        </div>
      `
    )
    .join("");
}

function renderRestrictedRecords() {
  const body = document.getElementById("restrictedRecordTable");
  const empty = document.getElementById("restrictedEmpty");

  if (!body) {
    return;
  }

  const search = document
    .getElementById("restrictedSearch")
    ?.value.toLowerCase() || "";

  const items = state.restrictedRecords.filter((record) =>
    String(record.title || "").toLowerCase().includes(search) ||
    String(record.userId || "").toLowerCase().includes(search)
  );

  body.innerHTML = items
    .map(
      (record) => `
        <tr>
          <td>${escapeHTML(record.title || "Record")}</td>
          <td>${escapeHTML(record.userId || "—")}</td>
          <td>${escapeHTML(record.status || "active")}</td>
          <td>${escapeHTML(formatDateTime(record.updated))}</td>
          <td>
            <button class="text-action" type="button" data-view-record="${record.id}">
              View
            </button>
          </td>
        </tr>
      `
    )
    .join("");

  if (empty) {
    empty.hidden = items.length > 0;
  }
}

function renderAccounts() {
  const body = document.getElementById("accountTable");

  if (!body) {
    return;
  }

  const active = state.staff.filter((item) => item.status === "active").length;
  const pending = state.staff.filter((item) => item.status === "pending").length;
  const suspended = state.staff.filter((item) => item.status === "suspended").length;
  const reset = state.staff.filter((item) => item.forcePasswordReset).length;

  document.querySelector("[data-account-active]").textContent = active;
  document.querySelector("[data-account-pending]").textContent = pending;
  document.querySelector("[data-account-suspended]").textContent = suspended;
  document.querySelector("[data-account-reset]").textContent = reset;

  body.innerHTML = state.staff
    .map(
      (member) => `
        <tr>
          <td>${escapeHTML(member.displayName)}</td>
          <td>${escapeHTML(member.role)}</td>
          <td>${escapeHTML(member.status)}</td>
          <td>${escapeHTML(member.lastLogin ? formatDateTime(member.lastLogin) : "—")}</td>
          <td>
            <button class="text-action" type="button" data-edit-staff="${member.id}">
              Manage
            </button>
          </td>
        </tr>
      `
    )
    .join("");
}

function renderAnnouncements() {
  const grid = document.getElementById("announcementGrid");
  const empty = document.getElementById("announcementEmpty");

  if (!grid) {
    return;
  }

  grid.innerHTML = state.announcements
    .map(
      (announcement) => `
        <article class="library-card">
          <h3>${escapeHTML(announcement.title)}</h3>
          ${announcement.description ? `<p>${escapeHTML(announcement.description)}</p>` : ""}

          <div class="library-card-footer">
            <span class="tag">${announcement.pinned ? "Pinned" : "Announcement"}</span>

            <button
              class="text-action"
              type="button"
              data-edit-announcement="${announcement.id}"
            >
              Edit
            </button>
          </div>
        </article>
      `
    )
    .join("");

  if (empty) {
    empty.hidden = state.announcements.length > 0;
  }
}

function renderAudit() {
  const body = document.getElementById("auditTable");
  const empty = document.getElementById("auditEmpty");
  const search = document.getElementById("auditSearch")?.value.toLowerCase() || "";
  const type = document.getElementById("auditTypeFilter")?.value || "";

  if (!body) {
    return;
  }

  const actions = [...new Set(state.audit.map((item) => item.action).filter(Boolean))];
  fillSelect("auditTypeFilter", actions, "All Actions");

  const items = state.audit.filter((item) => {
    const matchesSearch =
      String(item.user || "").toLowerCase().includes(search) ||
      String(item.action || "").toLowerCase().includes(search) ||
      String(item.target || "").toLowerCase().includes(search) ||
      String(item.details || "").toLowerCase().includes(search);

    const matchesType = !type || item.action === type;

    return matchesSearch && matchesType;
  });

  body.innerHTML = items
    .map(
      (item) => `
        <tr>
          <td>${escapeHTML(formatDateTime(item.time))}</td>
          <td>${escapeHTML(item.user)}</td>
          <td>${escapeHTML(item.action)}</td>
          <td>${escapeHTML(item.target || "—")}</td>
          <td>${escapeHTML(item.details || "—")}</td>
        </tr>
      `
    )
    .join("");

  if (empty) {
    empty.hidden = items.length > 0;
  }
}

function renderHelp() {
  const grid = document.getElementById("helpGrid");
  const empty = document.getElementById("helpEmpty");

  if (!grid) {
    return;
  }

  grid.innerHTML = state.help
    .map(
      (item) => `
        <article class="help-card">
          <h3>${escapeHTML(item.title)}</h3>
          ${item.description ? `<p>${escapeHTML(item.description)}</p>` : ""}

          <div class="library-card-footer">
            <button class="text-action" type="button" data-view-help="${item.id}">
              Open
            </button>

            ${
              userCan(5)
                ? `<button class="text-action" type="button" data-edit-help="${item.id}">Edit</button>`
                : ""
            }
          </div>
        </article>
      `
    )
    .join("");

  if (empty) {
    empty.hidden = state.help.length > 0;
  }
}

function openModal(title, body, actions = "") {
  const layer = document.getElementById("modalLayer");
  const titleElement = document.getElementById("modalTitle");
  const bodyElement = document.getElementById("modalBody");
  const actionsElement = document.getElementById("modalActions");

  if (!layer || !titleElement || !bodyElement || !actionsElement) {
    return;
  }

  titleElement.textContent = title;
  bodyElement.innerHTML = body;
  actionsElement.innerHTML = actions;
  layer.hidden = false;
}

function closeModal() {
  const layer = document.getElementById("modalLayer");

  if (layer) {
    layer.hidden = true;
  }
}

function openSimpleEditor({
  title,
  fields,
  onSave,
  onDelete = null
}) {
  const body = fields
    .map((field) => {
      if (field.type === "textarea") {
        return `
          <div class="form-row">
            <label>${escapeHTML(field.label)}</label>
            <textarea id="${field.id}">${escapeHTML(field.value || "")}</textarea>
          </div>
        `;
      }

      if (field.type === "checkbox") {
        return `
          <label class="toggle-row">
            <span><strong>${escapeHTML(field.label)}</strong></span>
            <input id="${field.id}" type="checkbox" ${field.value ? "checked" : ""}>
            <span class="toggle"></span>
          </label>
        `;
      }

      if (field.type === "select") {
        return `
          <div class="form-row">
            <label>${escapeHTML(field.label)}</label>
            <select id="${field.id}">
              ${field.options
                .map(
                  (option) => `
                    <option
                      value="${escapeHTML(option.value)}"
                      ${option.value === field.value ? "selected" : ""}
                    >
                      ${escapeHTML(option.label)}
                    </option>
                  `
                )
                .join("")}
            </select>
          </div>
        `;
      }

      return `
        <div class="form-row">
          <label>${escapeHTML(field.label)}</label>
          <input
            id="${field.id}"
            type="${field.type || "text"}"
            value="${escapeHTML(field.value || "")}"
          >
        </div>
      `;
    })
    .join("");

  const actions = `
    ${
      onDelete
        ? `<button class="danger-action" type="button" id="editorDelete">Delete</button>`
        : ""
    }
    <button class="secondary-action" type="button" data-close-modal>Cancel</button>
    <button class="primary-action" type="button" id="editorSave">Save</button>
  `;

  openModal(title, `<div class="form-grid">${body}</div>`, actions);

  document.getElementById("editorSave")?.addEventListener("click", () => {
    const values = {};

    fields.forEach((field) => {
      const element = document.getElementById(field.id);

      if (!element) {
        return;
      }

      values[field.id] =
        field.type === "checkbox"
          ? element.checked
          : element.value;
    });

    onSave(values);
  });

  document.getElementById("editorDelete")?.addEventListener("click", () => {
    onDelete?.();
  });
}

function openPolicyEditor(id = null) {
  if (!userCan(5)) return;

  const existing = state.policies.find((item) => item.id === id);

  openSimpleEditor({
    title: existing ? "Edit Policy" : "New Policy",
    fields: [
      {
        id: "policyTitle",
        label: "Title",
        value: existing?.title || ""
      },
      {
        id: "policyCategory",
        label: "Category",
        value: existing?.category || ""
      },
      {
        id: "policyDescription",
        label: "Description",
        type: "textarea",
        value: existing?.description || ""
      },
      {
        id: "policyBody",
        label: "Content",
        type: "textarea",
        value: existing?.body || ""
      }
    ],
    onSave(values) {
      const item = existing || {
        id: uid("policy")
      };

      item.title = values.policyTitle.trim() || "Untitled Policy";
      item.category = values.policyCategory.trim();
      item.description = values.policyDescription.trim();
      item.body = values.policyBody;

      if (!existing) {
        state.policies.unshift(item);
      }

      addAudit(existing ? "Edited policy" : "Created policy", item.title);
      saveState();
      closeModal();
      renderPolicies();
    },
    onDelete: existing
      ? () => {
          state.policies = state.policies.filter((item) => item.id !== existing.id);
          addAudit("Deleted policy", existing.title);
          saveState();
          closeModal();
          renderPolicies();
        }
      : null
  });
}

function openResourceEditor(id = null) {
  if (!userCan(5)) return;

  const existing = state.resources.find((item) => item.id === id);

  openSimpleEditor({
    title: existing ? "Edit Resource" : "New Resource",
    fields: [
      {
        id: "resourceTitle",
        label: "Title",
        value: existing?.title || ""
      },
      {
        id: "resourceCategory",
        label: "Category",
        value: existing?.category || ""
      },
      {
        id: "resourceDescription",
        label: "Description",
        type: "textarea",
        value: existing?.description || ""
      },
      {
        id: "resourceUrl",
        label: "URL",
        value: existing?.url || ""
      }
    ],
    onSave(values) {
      const item = existing || {
        id: uid("resource")
      };

      item.title = values.resourceTitle.trim() || "Untitled Resource";
      item.category = values.resourceCategory.trim();
      item.description = values.resourceDescription.trim();
      item.url = values.resourceUrl.trim();

      if (!existing) {
        state.resources.unshift(item);
      }

      addAudit(existing ? "Edited resource" : "Created resource", item.title);
      saveState();
      closeModal();
      renderResources();
    },
    onDelete: existing
      ? () => {
          state.resources = state.resources.filter((item) => item.id !== existing.id);
          addAudit("Deleted resource", existing.title);
          saveState();
          closeModal();
          renderResources();
        }
      : null
  });
}

function openAnnouncementEditor(id = null) {
  if (!userCan(5)) return;

  const existing = state.announcements.find((item) => item.id === id);

  openSimpleEditor({
    title: existing ? "Edit Announcement" : "New Announcement",
    fields: [
      {
        id: "announcementTitle",
        label: "Title",
        value: existing?.title || ""
      },
      {
        id: "announcementDescription",
        label: "Description",
        type: "textarea",
        value: existing?.description || ""
      },
      {
        id: "announcementPinned",
        label: "Pinned",
        type: "checkbox",
        value: existing?.pinned || false
      }
    ],
    onSave(values) {
      const item = existing || {
        id: uid("announcement"),
        created: new Date().toISOString()
      };

      item.title = values.announcementTitle.trim() || "Untitled Announcement";
      item.description = values.announcementDescription.trim();
      item.pinned = values.announcementPinned;

      if (!existing) {
        state.announcements.unshift(item);
      }

      addAudit(
        existing ? "Edited announcement" : "Created announcement",
        item.title
      );

      saveState();
      closeModal();
      renderAnnouncements();
      renderDashboard();
    },
    onDelete: existing
      ? () => {
          state.announcements = state.announcements.filter(
            (item) => item.id !== existing.id
          );

          addAudit("Deleted announcement", existing.title);
          saveState();
          closeModal();
          renderAnnouncements();
          renderDashboard();
        }
      : null
  });
}

function openHelpEditor(id = null) {
  if (!userCan(5)) return;

  const existing = state.help.find((item) => item.id === id);

  openSimpleEditor({
    title: existing ? "Edit Help Article" : "New Help Article",
    fields: [
      {
        id: "helpTitle",
        label: "Title",
        value: existing?.title || ""
      },
      {
        id: "helpDescription",
        label: "Description",
        type: "textarea",
        value: existing?.description || ""
      },
      {
        id: "helpBody",
        label: "Content",
        type: "textarea",
        value: existing?.body || ""
      }
    ],
    onSave(values) {
      const item = existing || {
        id: uid("help")
      };

      item.title = values.helpTitle.trim() || "Untitled";
      item.description = values.helpDescription.trim();
      item.body = values.helpBody;

      if (!existing) {
        state.help.push(item);
      }

      addAudit(existing ? "Edited help article" : "Created help article", item.title);
      saveState();
      closeModal();
      renderHelp();
    },
    onDelete: existing
      ? () => {
          state.help = state.help.filter((item) => item.id !== existing.id);
          addAudit("Deleted help article", existing.title);
          saveState();
          closeModal();
          renderHelp();
        }
      : null
  });
}

function openStaffEditor(id = null) {
  if (!userCan(4)) return;

  const existing = state.staff.find((item) => item.id === id);

  const maxClearance = userCan(5)
    ? 5
    : Math.max(1, state.currentUser.clearance - 1);

  const clearanceOptions = Array.from(
    { length: maxClearance },
    (_, index) => index + 1
  );

  openSimpleEditor({
    title: existing ? "Manage Staff" : "Add Staff",
    fields: [
      {
        id: "staffDisplayName",
        label: "Display Name",
        value: existing?.displayName || ""
      },
      {
        id: "staffUsername",
        label: "Username",
        value: existing?.username || ""
      },
      {
        id: "staffRole",
        label: "Role",
        value: existing?.role || "Cadet"
      },
      {
        id: "staffDescription",
        label: "Description",
        type: "textarea",
        value: existing?.description || ""
      },
      {
        id: "staffClearance",
        label: "Clearance",
        type: "select",
        value: String(existing?.clearance || 1),
        options: clearanceOptions.map((value) => ({
          value: String(value),
          label: `Clearance ${value}`
        }))
      },
      {
        id: "staffStatus",
        label: "Status",
        type: "select",
        value: existing?.status || "active",
        options: [
          { value: "active", label: "Active" },
          { value: "pending", label: "Pending" },
          { value: "suspended", label: "Suspended" }
        ]
      },
      {
        id: "staffForceReset",
        label: "Require Password Change",
        type: "checkbox",
        value: existing?.forcePasswordReset || false
      }
    ],
    onSave(values) {
      const item = existing || {
        id: uid("staff"),
        mentor: null
      };

      item.displayName = values.staffDisplayName.trim() || "Staff Member";
      item.username = values.staffUsername.trim();
      item.initials = getInitials(item.displayName);
      item.role = values.staffRole.trim() || "Staff";
      item.description = values.staffDescription.trim();
      item.clearance = Number(values.staffClearance);
      item.status = values.staffStatus;
      item.forcePasswordReset = values.staffForceReset;

      if (!existing) {
        state.staff.push(item);
      }

      addAudit(existing ? "Edited staff account" : "Created staff account", item.displayName);

      if (item.id === state.currentUser.id) {
        state.currentUser = {
          ...state.currentUser,
          ...item
        };
      }

      saveState();
      closeModal();
      applyClearance();
      bindUser();
      renderStaffManagement();
      renderAccounts();
    },
    onDelete:
      existing && existing.id !== state.currentUser.id && userCan(5)
        ? () => {
            state.staff = state.staff.filter((item) => item.id !== existing.id);
            addAudit("Deleted staff account", existing.displayName);
            saveState();
            closeModal();
            renderStaffManagement();
            renderAccounts();
          }
        : null
  });
}

function openOnboardingEditor(id = null) {
  if (!userCan(4)) return;

  const existing = state.onboarding.find((item) => item.id === id);

  openSimpleEditor({
    title: existing ? "Edit Onboarding Step" : "New Onboarding Step",
    fields: [
      {
        id: "onboardingTitle",
        label: "Title",
        value: existing?.title || ""
      },
      {
        id: "onboardingDescription",
        label: "Description",
        type: "textarea",
        value: existing?.description || ""
      },
      {
        id: "onboardingRequired",
        label: "Required",
        type: "checkbox",
        value: existing?.required ?? true
      }
    ],
    onSave(values) {
      const item = existing || {
        id: uid("onboarding"),
        order: state.onboarding.length + 1,
        completed: false,
        locked: false
      };

      item.title = values.onboardingTitle.trim() || "Untitled Step";
      item.description = values.onboardingDescription.trim();
      item.required = values.onboardingRequired;

      if (!existing) {
        state.onboarding.push(item);
      }

      addAudit(
        existing ? "Edited onboarding step" : "Created onboarding step",
        item.title
      );

      saveState();
      closeModal();
      renderOnboardingManagement();
      renderOnboarding();
    },
    onDelete: existing
      ? () => {
          state.onboarding = state.onboarding.filter(
            (item) => item.id !== existing.id
          );

          addAudit("Deleted onboarding step", existing.title);
          saveState();
          closeModal();
          renderOnboardingManagement();
          renderOnboarding();
        }
      : null
  });
}

function openRestrictedRecordEditor(id = null) {
  if (!userCan(4)) return;

  const existing = state.restrictedRecords.find((item) => item.id === id);

  openSimpleEditor({
    title: existing ? "Restricted Record" : "New Restricted Record",
    fields: [
      {
        id: "recordTitle",
        label: "Title",
        value: existing?.title || ""
      },
      {
        id: "recordUserId",
        label: "User ID",
        value: existing?.userId || ""
      },
      {
        id: "recordStatus",
        label: "Status",
        value: existing?.status || "active"
      },
      {
        id: "recordDescription",
        label: "Description",
        type: "textarea",
        value: existing?.description || ""
      },
      {
        id: "recordEvidence",
        label: "Evidence / Notes",
        type: "textarea",
        value: existing?.evidence || ""
      }
    ],
    onSave(values) {
      const item = existing || {
        id: uid("record"),
        created: new Date().toISOString()
      };

      item.title = values.recordTitle.trim() || "Restricted Record";

      if (!existing) {
        item.userId = values.recordUserId.trim();
      }

      item.status = values.recordStatus.trim() || "active";
      item.description = values.recordDescription.trim();
      item.evidence = values.recordEvidence;
      item.updated = new Date().toISOString();

      if (!existing) {
        state.restrictedRecords.unshift(item);
      }

      addAudit(
        existing ? "Edited restricted record" : "Created restricted record",
        item.title,
        item.userId || ""
      );

      saveState();
      closeModal();
      renderRestrictedRecords();
    }
  });
}

function openLessonEditor(id = null) {
  if (!userCan(4)) return;

  const existing = state.lessons.find((item) => item.id === id);

  openSimpleEditor({
    title: existing ? "Edit Lesson" : "New Lesson",
    fields: [
      {
        id: "lessonTitle",
        label: "Title",
        value: existing?.title || ""
      },
      {
        id: "lessonDescription",
        label: "Description",
        type: "textarea",
        value: existing?.description || ""
      },
      {
        id: "lessonContent",
        label: "Content",
        type: "textarea",
        value: existing?.content || ""
      },
      {
        id: "lessonStatus",
        label: "Status",
        type: "select",
        value: existing?.status || "locked",
        options: [
          { value: "available", label: "Available" },
          { value: "locked", label: "Locked" },
          { value: "complete", label: "Complete" }
        ]
      },
      {
        id: "lessonMentorUnlock",
        label: "Requires Mentor Unlock",
        type: "checkbox",
        value: existing?.mentorUnlock || false
      }
    ],
    onSave(values) {
      const item = existing || {
        id: uid("lesson"),
        order: state.lessons.length + 1,
        progress: 0,
        score: null,
        prerequisite: state.lessons.at(-1)?.id || null
      };

      item.title = values.lessonTitle.trim() || "Untitled Lesson";
      item.description = values.lessonDescription.trim();
      item.content = values.lessonContent;
      item.status = values.lessonStatus;
      item.mentorUnlock = values.lessonMentorUnlock;

      if (!existing) {
        state.lessons.push(item);
      }

      addAudit(existing ? "Edited lesson" : "Created lesson", item.title);

      saveState();
      closeModal();
      renderTraining();
      renderCurriculum();
    },
    onDelete: existing
      ? () => {
          state.lessons = state.lessons.filter((item) => item.id !== existing.id);
          currentLessonId = null;
          currentCurriculumLessonId = null;
          addAudit("Deleted lesson", existing.title);
          saveState();
          closeModal();
          renderTraining();
          renderCurriculum();
        }
      : null
  });
}

function saveCurriculumLesson(id) {
  const lesson = state.lessons.find((item) => item.id === id);

  if (!lesson) {
    return;
  }

  lesson.title =
    document.getElementById("curriculumTitle")?.value.trim() || "Untitled Lesson";

  lesson.description =
    document.getElementById("curriculumDescription")?.value.trim() || "";

  lesson.content =
    document.getElementById("curriculumContent")?.value || "";

  lesson.status =
    document.getElementById("curriculumStatus")?.value || "locked";

  addAudit("Edited lesson", lesson.title);
  saveState();
  renderCurriculum();
  renderTraining();
  toast("Lesson saved");
}

function openGradeFeedback(id) {
  const grade = state.grades.find((item) => item.id === id);

  if (!grade) {
    return;
  }

  openModal(
    grade.title,
    `
      <div class="form-grid">
        <div>
          <strong>Score</strong>
          <p>${typeof grade.score === "number" ? `${grade.score}%` : "—"}</p>
        </div>

        ${
          grade.feedback
            ? `
              <div>
                <strong>Feedback</strong>
                <p>${escapeHTML(grade.feedback)}</p>
              </div>
            `
            : ""
        }
      </div>
    `,
    `<button class="secondary-action" type="button" data-close-modal>Close</button>`
  );
}

function openPolicy(id) {
  const policy = state.policies.find((item) => item.id === id);

  if (!policy) {
    return;
  }

  openModal(
    policy.title,
    `
      ${
        policy.description
          ? `<p>${escapeHTML(policy.description)}</p>`
          : ""
      }

      <div>${escapeHTML(policy.body || "").replaceAll("\n", "<br>")}</div>
    `,
    `<button class="secondary-action" type="button" data-close-modal>Close</button>`
  );
}

function openHelp(id) {
  const item = state.help.find((entry) => entry.id === id);

  if (!item) {
    return;
  }

  openModal(
    item.title,
    `
      ${item.description ? `<p>${escapeHTML(item.description)}</p>` : ""}
      <div>${escapeHTML(item.body || "").replaceAll("\n", "<br>")}</div>
    `,
    `<button class="secondary-action" type="button" data-close-modal>Close</button>`
  );
}

function openRestrictedRecord(id) {
  const record = state.restrictedRecords.find((item) => item.id === id);

  if (!record) {
    return;
  }

  addAudit(
    "Viewed restricted record",
    record.title,
    record.userId || ""
  );

  openModal(
    record.title,
    `
      <div class="detail-list">
        <div>
          <dt>User ID</dt>
          <dd>${escapeHTML(record.userId || "—")}</dd>
        </div>

        <div>
          <dt>Status</dt>
          <dd>${escapeHTML(record.status || "—")}</dd>
        </div>

        <div>
          <dt>Description</dt>
          <dd>${escapeHTML(record.description || "—")}</dd>
        </div>

        <div>
          <dt>Evidence / Notes</dt>
          <dd>${escapeHTML(record.evidence || "—").replaceAll("\n", "<br>")}</dd>
        </div>
      </div>
    `,
    `
      <button class="secondary-action" type="button" data-close-modal>Close</button>
      <button class="primary-action" type="button" data-edit-record="${record.id}">Edit</button>
    `
  );
}

function manageCadetTraining(id) {
  const cadet = state.staff.find((item) => item.id === id);

  if (!cadet) {
    return;
  }

  openModal(
    `${cadet.displayName} · Training`,
    `
      <div class="form-grid">
        ${state.lessons
          .sort((a, b) => a.order - b.order)
          .map(
            (lesson) => `
              <div class="setting-row">
                <div>
                  <strong>${escapeHTML(lesson.title)}</strong>
                  <span>${escapeHTML(lesson.status)}</span>
                </div>

                <button
                  class="secondary-action"
                  type="button"
                  data-toggle-lesson-lock="${lesson.id}"
                >
                  ${lesson.status === "locked" ? "Unlock" : "Lock"}
                </button>
              </div>
            `
          )
          .join("")}
      </div>
    `,
    `<button class="secondary-action" type="button" data-close-modal>Close</button>`
  );
}

function openSubmissionReview(id) {
  const submission = state.submissions.find((item) => item.id === id);

  if (!submission) {
    return;
  }

  openModal(
    submission.title,
    `
      <div class="form-grid">
        <div>
          <strong>${escapeHTML(submission.staffName || "")}</strong>
        </div>

        <div>
          ${escapeHTML(submission.content || "").replaceAll("\n", "<br>")}
        </div>

        <div class="form-row">
          <label>Score</label>
          <input id="reviewScore" type="number" min="0" max="100">
        </div>

        <div class="form-row">
          <label>Feedback</label>
          <textarea id="reviewFeedback"></textarea>
        </div>
      </div>
    `,
    `
      <button class="secondary-action" type="button" data-close-modal>Cancel</button>
      <button class="primary-action" type="button" id="submitReview">Submit Review</button>
    `
  );

  document.getElementById("submitReview")?.addEventListener("click", () => {
    const score = Number(document.getElementById("reviewScore")?.value);
    const feedback = document.getElementById("reviewFeedback")?.value.trim();

    submission.status = "complete";
    submission.score = Number.isFinite(score) ? score : null;
    submission.feedback = feedback;
    submission.reviewer = state.currentUser.displayName;

    state.grades.unshift({
      id: uid("grade"),
      title: submission.title,
      status: "complete",
      score: submission.score,
      reviewer: state.currentUser.displayName,
      feedback
    });

    if (feedback) {
      state.feedback.unshift({
        id: uid("feedback"),
        title: submission.title,
        body: feedback,
        time: new Date().toISOString()
      });
    }

    addAudit("Reviewed submission", submission.title, submission.staffName || "");

    saveState();
    closeModal();
    renderSubmissions();
    renderGrades();
    updateCounts();
  });
}

function setupSearch() {
  const input = document.getElementById("portalSearch");

  input?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") {
      return;
    }

    const query = input.value.trim().toLowerCase();

    if (!query) {
      return;
    }

    const pages = [...document.querySelectorAll("[data-page]")];

    const match = pages.find((page) =>
      page.textContent.toLowerCase().includes(query)
    );

    if (match) {
      navigateTo(match.dataset.page);
      toast(`Opened ${match.dataset.page.replaceAll("-", " ")}`);
    } else {
      toast("No matching section found");
    }
  });
}

function setupSettings() {
  document.querySelectorAll("[data-settings-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.settingsTarget;

      document.querySelectorAll(".settings-tab").forEach((tab) => {
        tab.classList.toggle("active", tab === button);
      });

      document.querySelectorAll("[data-settings-section]").forEach((section) => {
        section.classList.toggle(
          "active",
          section.dataset.settingsSection === target
        );
      });
    });
  });

  document.getElementById("themeSelect")?.addEventListener("change", (event) => {
    settings.theme = event.target.value;
    saveSettings();
    applyTheme();
  });

  document.getElementById("densitySelect")?.addEventListener("change", (event) => {
    settings.density = event.target.value;
    saveSettings();
    applyTheme();
  });

  document.getElementById("sidebarPreference")?.addEventListener("change", (event) => {
    settings.sidebar = event.target.value;
    saveSettings();
    applyTheme();
  });

  document.getElementById("reducedMotionToggle")?.addEventListener("change", (event) => {
    settings.reducedMotion = event.target.checked;
    saveSettings();
    applyTheme();
  });

  document.getElementById("highContrastToggle")?.addEventListener("change", (event) => {
    settings.highContrast = event.target.checked;
    saveSettings();
    applyTheme();
  });

  document.getElementById("notifyMessages")?.addEventListener("change", (event) => {
    settings.notifyMessages = event.target.checked;
    saveSettings();
  });

  document.getElementById("notifyTraining")?.addEventListener("change", (event) => {
    settings.notifyTraining = event.target.checked;
    saveSettings();
  });

  document.getElementById("notifyGrades")?.addEventListener("change", (event) => {
    settings.notifyGrades = event.target.checked;
    saveSettings();
  });

  document.getElementById("notifyPolicies")?.addEventListener("change", (event) => {
    settings.notifyPolicies = event.target.checked;
    saveSettings();
  });

  document.getElementById("messagePreviewToggle")?.addEventListener("change", (event) => {
    settings.messagePreviews = event.target.checked;
    saveSettings();
    renderMessages();
  });

  document.getElementById("contentEditToggle")?.addEventListener("change", (event) => {
    setContentEditing(event.target.checked);
  });

  document.getElementById("savePortalContentButton")?.addEventListener("click", () => {
    if (!userCan(5)) {
      return;
    }

    saveContent();
    addAudit("Saved portal content");
    toast("Portal content saved");
  });

  document.getElementById("resetPortalContentButton")?.addEventListener("click", () => {
    if (!userCan(5)) {
      return;
    }

    content = clone(defaultContent);
    localStorage.setItem(CONTENT_KEY, JSON.stringify(content));
    applyContent();
    addAudit("Reset portal content");
    toast("Portal content reset");
  });

  document.getElementById("changePasswordButton")?.addEventListener("click", () => {
    toast("Password changes will be connected with the backend.");
  });

  document.getElementById("signOutEverywhereButton")?.addEventListener("click", () => {
    toast("Session controls will be connected with the backend.");
  });
}

function setupNavigation() {
  document.addEventListener("click", (event) => {
    const pageTarget = event.target.closest("[data-page-target]");

    if (pageTarget) {
      navigateTo(pageTarget.dataset.pageTarget);
      return;
    }

    const close = event.target.closest("[data-close-modal]");

    if (close) {
      closeModal();
      return;
    }

    const lessonButton = event.target.closest("[data-open-lesson]");

    if (lessonButton) {
      currentLessonId = lessonButton.dataset.openLesson;
      renderTraining();
      return;
    }

    const completeLessonButton = event.target.closest("[data-complete-lesson]");

    if (completeLessonButton) {
      completeLesson(completeLessonButton.dataset.completeLesson);
      return;
    }

    const editLessonButton = event.target.closest("[data-edit-lesson]");

    if (editLessonButton) {
      openLessonEditor(editLessonButton.dataset.editLesson);
      return;
    }

    const thread = event.target.closest("[data-thread-id]");

    if (thread) {
      currentConversationId = thread.dataset.threadId;
      renderMessages();
      return;
    }

    const notification = event.target.closest("[data-notification-id]");

    if (notification) {
      markNotificationRead(notification.dataset.notificationId);
      return;
    }

    const viewGrade = event.target.closest("[data-view-grade]");

    if (viewGrade) {
      openGradeFeedback(viewGrade.dataset.viewGrade);
      return;
    }

    const viewPolicy = event.target.closest("[data-view-policy]");

    if (viewPolicy) {
      openPolicy(viewPolicy.dataset.viewPolicy);
      return;
    }

    const editPolicy = event.target.closest("[data-edit-policy]");

    if (editPolicy) {
      openPolicyEditor(editPolicy.dataset.editPolicy);
      return;
    }

    const editResource = event.target.closest("[data-edit-resource]");

    if (editResource) {
      openResourceEditor(editResource.dataset.editResource);
      return;
    }

    const messageStaff = event.target.closest("[data-message-staff]");

    if (messageStaff) {
      startStaffConversation(messageStaff.dataset.messageStaff);
      return;
    }

    const mentorCadet = event.target.closest("[data-mentor-cadet]");

    if (mentorCadet) {
      currentMentorCadetId = mentorCadet.dataset.mentorCadet;
      renderMentor();
      return;
    }

    const manageCadet = event.target.closest("[data-manage-cadet]");

    if (manageCadet) {
      manageCadetTraining(manageCadet.dataset.manageCadet);
      return;
    }

    const toggleLesson = event.target.closest("[data-toggle-lesson-lock]");

    if (toggleLesson) {
      const lesson = state.lessons.find(
        (item) => item.id === toggleLesson.dataset.toggleLessonLock
      );

      if (lesson) {
        lesson.status = lesson.status === "locked" ? "available" : "locked";
        saveState();
        manageCadetTraining(currentMentorCadetId);
      }

      return;
    }

    const reviewSubmission = event.target.closest("[data-review-submission]");

    if (reviewSubmission) {
      openSubmissionReview(reviewSubmission.dataset.reviewSubmission);
      return;
    }

    const editStaff = event.target.closest("[data-edit-staff]");

    if (editStaff) {
      openStaffEditor(editStaff.dataset.editStaff);
      return;
    }

    const curriculumLesson = event.target.closest("[data-curriculum-lesson]");

    if (curriculumLesson) {
      currentCurriculumLessonId = curriculumLesson.dataset.curriculumLesson;
      renderCurriculum();
      return;
    }

    const saveCurriculum = event.target.closest("[data-save-curriculum]");

    if (saveCurriculum) {
      saveCurriculumLesson(saveCurriculum.dataset.saveCurriculum);
      return;
    }

    const deleteLesson = event.target.closest("[data-delete-lesson]");

    if (deleteLesson) {
      const lesson = state.lessons.find(
        (item) => item.id === deleteLesson.dataset.deleteLesson
      );

      if (lesson) {
        state.lessons = state.lessons.filter((item) => item.id !== lesson.id);
        currentCurriculumLessonId = null;
        addAudit("Deleted lesson", lesson.title);
        saveState();
        renderCurriculum();
        renderTraining();
      }

      return;
    }

    const editOnboarding = event.target.closest("[data-edit-onboarding]");

    if (editOnboarding) {
      openOnboardingEditor(editOnboarding.dataset.editOnboarding);
      return;
    }

    const viewRecord = event.target.closest("[data-view-record]");

    if (viewRecord) {
      openRestrictedRecord(viewRecord.dataset.viewRecord);
      return;
    }

    const editRecord = event.target.closest("[data-edit-record]");

    if (editRecord) {
      closeModal();
      openRestrictedRecordEditor(editRecord.dataset.editRecord);
      return;
    }

    const editAnnouncement = event.target.closest("[data-edit-announcement]");

    if (editAnnouncement) {
      openAnnouncementEditor(editAnnouncement.dataset.editAnnouncement);
      return;
    }

    const viewHelp = event.target.closest("[data-view-help]");

    if (viewHelp) {
      openHelp(viewHelp.dataset.viewHelp);
      return;
    }

    const editHelp = event.target.closest("[data-edit-help]");

    if (editHelp) {
      openHelpEditor(editHelp.dataset.editHelp);
    }
  });
}

function startStaffConversation(staffId) {
  const member = state.staff.find((item) => item.id === staffId);

  if (!member) {
    return;
  }

  let thread = state.messages.find((item) => item.staffId === member.id);

  if (!thread) {
    thread = {
      id: uid("thread"),
      staffId: member.id,
      name: member.displayName,
      initials: member.initials,
      role: member.role,
      unread: 0,
      messages: []
    };

    state.messages.unshift(thread);
  }

  currentConversationId = thread.id;
  saveState();
  navigateTo("messages");
}

function setupForms() {
  document.getElementById("messageForm")?.addEventListener("submit", (event) => {
    event.preventDefault();

    const input = document.getElementById("messageInput");

    if (!input) {
      return;
    }

    sendMessage(input.value);
    input.value = "";
  });

  document.getElementById("messageSearch")?.addEventListener("input", renderMessages);
  document.getElementById("policySearch")?.addEventListener("input", renderPolicies);
  document.getElementById("policyCategoryFilter")?.addEventListener("change", renderPolicies);
  document.getElementById("resourceSearch")?.addEventListener("input", renderResources);
  document.getElementById("resourceCategoryFilter")?.addEventListener("change", renderResources);
  document.getElementById("staffSearch")?.addEventListener("input", renderStaff);
  document.getElementById("staffRoleFilter")?.addEventListener("change", renderStaff);
  document.getElementById("staffManagementSearch")?.addEventListener("input", renderStaffManagement);
  document.getElementById("staffManagementStatus")?.addEventListener("change", renderStaffManagement);
  document.getElementById("restrictedSearch")?.addEventListener("input", renderRestrictedRecords);
  document.getElementById("auditSearch")?.addEventListener("input", renderAudit);
  document.getElementById("auditTypeFilter")?.addEventListener("change", renderAudit);

  document.addEventListener("change", (event) => {
    const onboardingCheck = event.target.closest("[data-onboarding-check]");

    if (!onboardingCheck) {
      return;
    }

    const item = state.onboarding.find(
      (entry) => entry.id === onboardingCheck.dataset.onboardingCheck
    );

    if (!item) {
      return;
    }

    item.completed = onboardingCheck.checked;

    addActivity(
      item.completed
        ? `${item.title} completed`
        : `${item.title} reopened`
    );

    saveState();
    renderOnboarding();
  });
}

function setupButtons() {
  document.getElementById("sidebarToggle")?.addEventListener("click", () => {
    document.body.classList.toggle("sidebar-collapsed");

    settings.sidebar = document.body.classList.contains("sidebar-collapsed")
      ? "collapsed"
      : "expanded";

    saveSettings();

    const select = document.getElementById("sidebarPreference");

    if (select) {
      select.value = settings.sidebar;
    }
  });

  document.getElementById("mobileMenu")?.addEventListener("click", () => {
    document.body.classList.toggle("mobile-sidebar-open");
  });

  document.getElementById("mobileOverlay")?.addEventListener("click", () => {
    document.body.classList.remove("mobile-sidebar-open");
  });

  document.getElementById("notificationButton")?.addEventListener("click", () => {
    const drawer = document.getElementById("notificationDrawer");

    if (drawer) {
      drawer.hidden = false;
      renderNotifications();
    }
  });

  document.getElementById("closeNotificationDrawer")?.addEventListener("click", () => {
    const drawer = document.getElementById("notificationDrawer");

    if (drawer) {
      drawer.hidden = true;
    }
  });

  document.getElementById("markNotificationsRead")?.addEventListener(
    "click",
    markAllNotificationsRead
  );

  document.getElementById("newMessageButton")?.addEventListener(
    "click",
    openNewMessageModal
  );

  document.getElementById("createPolicyButton")?.addEventListener(
    "click",
    () => openPolicyEditor()
  );

  document.getElementById("createResourceButton")?.addEventListener(
    "click",
    () => openResourceEditor()
  );

  document.getElementById("inviteStaffButton")?.addEventListener(
    "click",
    () => openStaffEditor()
  );

  document.getElementById("newLessonButton")?.addEventListener(
    "click",
    () => openLessonEditor()
  );

  document.getElementById("newOnboardingStepButton")?.addEventListener(
    "click",
    () => openOnboardingEditor()
  );

  document.getElementById("newRestrictedRecordButton")?.addEventListener(
    "click",
    () => openRestrictedRecordEditor()
  );

  document.getElementById("newAnnouncementButton")?.addEventListener(
    "click",
    () => openAnnouncementEditor()
  );

  document.getElementById("editProfileButton")?.addEventListener("click", () => {
    openSimpleEditor({
      title: "Edit Profile",
      fields: [
        {
          id: "profileDisplayName",
          label: "Display Name",
          value: state.currentUser.displayName
        },
        {
          id: "profileUsername",
          label: "Username",
          value: state.currentUser.username
        }
      ],
      onSave(values) {
        state.currentUser.displayName =
          values.profileDisplayName.trim() || "Portal User";

        state.currentUser.username = values.profileUsername.trim();
        state.currentUser.initials = getInitials(state.currentUser.displayName);

        const staffRecord = state.staff.find(
          (item) => item.id === state.currentUser.id
        );

        if (staffRecord) {
          staffRecord.displayName = state.currentUser.displayName;
          staffRecord.username = state.currentUser.username;
          staffRecord.initials = state.currentUser.initials;
        }

        addAudit("Updated profile");
        saveState();
        bindUser();
        closeModal();
      }
    });
  });

  document.getElementById("signOutButton")?.addEventListener("click", () => {
    toast("Authentication will be connected with the backend.");
  });

  document.querySelector('[data-admin-action="maintenance"]')?.addEventListener(
    "click",
    () => {
      if (!userCan(5)) {
        return;
      }

      state.maintenanceMode = !state.maintenanceMode;
      addAudit(
        state.maintenanceMode
          ? "Enabled maintenance mode"
          : "Disabled maintenance mode"
      );
      saveState();

      toast(
        state.maintenanceMode
          ? "Maintenance mode enabled"
          : "Maintenance mode disabled"
      );
    }
  );

  document.querySelector('[data-admin-action="backup"]')?.addEventListener(
    "click",
    exportBackup
  );

  document.querySelector('[data-admin-action="permissions"]')?.addEventListener(
    "click",
    () => navigateTo("staff-management")
  );

  document.querySelector('[data-admin-action="content"]')?.addEventListener(
    "click",
    () => {
      navigateTo("settings");

      const button = document.querySelector('[data-settings-target="portal"]');

      button?.click();
    }
  );
}

function exportBackup() {
  if (!userCan(5)) {
    return;
  }

  const backup = {
    state,
    content,
    settings,
    exported: new Date().toISOString()
  };

  const blob = new Blob(
    [JSON.stringify(backup, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `mod-portal-backup-${Date.now()}.json`;
  link.click();

  URL.revokeObjectURL(url);

  addAudit("Exported portal backup");
}

function setupSystemThemeListener() {
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      if (settings.theme === "system") {
        applyTheme();
      }
    });

  window.addEventListener("resize", () => {
    if (settings.sidebar === "auto") {
      applyTheme();
    }

    if (window.innerWidth > 920) {
      document.body.classList.remove("mobile-sidebar-open");
    }
  });
}

function restorePage() {
  const hash = location.hash.replace("#", "").trim();

  if (hash && document.querySelector(`[data-page="${hash}"]`)) {
    navigateTo(hash);
  } else {
    navigateTo("dashboard");
  }
}

function initialize() {
  applyContent();
  bindUser();
  applyClearance();
  applyTheme();
  setupNavigation();
  setupSettings();
  setupForms();
  setupButtons();
  setupSearch();
  setupSystemThemeListener();
  updateCounts();
  renderNotifications();
  restorePage();
}

initialize();
