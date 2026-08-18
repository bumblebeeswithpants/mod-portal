const app = {
  user: window.PORTAL_BOOTSTRAP.user,
  content: window.PORTAL_BOOTSTRAP.content || {},
  announcements: window.PORTAL_BOOTSTRAP.announcements || [],
  settings: window.PORTAL_BOOTSTRAP.settings || {},
  page: "dashboard",
  lesson: null,
  lessonPageId: "",
  quizId: "",
  curriculum: null,
  restrictedPassword: "",
  restrictedData: null
};

const pageTitles = {
  dashboard: "Dashboard",
  training: "Training",
  grades: "Grades & Feedback",
  messages: "Messages",
  notifications: "Notifications",
  policies: "Policies",
  resources: "Resources",
  staff: "Meet the Staff",
  onboarding: "Onboarding",
  mentor: "Mentor Tools",
  submissions: "Submission Queue",
  "staff-management": "Staff Management",
  curriculum: "Curriculum Management",
  "onboarding-management": "Onboarding Management",
  restricted: "Restricted Records",
  audit: "Audit Log",
  accounts: "Accounts",
  announcements: "Announcements",
  "portal-content": "Portal Content",
  "admin-tools": "Admin Tools",
  profile: "Profile",
  settings: "Settings",
  help: "Help / Portal Guide"
};

const pageContent =
  document.getElementById(
    "pageContent"
  );

const pageTitle =
  document.getElementById(
    "pageTitle"
  );

const modalBackdrop =
  document.getElementById(
    "modalBackdrop"
  );

const modalTitle =
  document.getElementById(
    "modalTitle"
  );

const modalBody =
  document.getElementById(
    "modalBody"
  );

function esc(value) {
  return String(
    value == null
      ? ""
      : value
  ).replace(
    /[&<>"']/g,
    char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]
  );
}

function nl(value) {
  return esc(value)
    .replace(
      /\n/g,
      "<br>"
    );
}

function bool(value) {
  return (
    value === true ||
    value === 1 ||
    String(value)
      .toLowerCase() ===
      "true"
  );
}

function fmtDate(value) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  return Number.isNaN(
    date.getTime()
  )
    ? esc(value)
    : date.toLocaleString();
}

function initials(name) {
  return String(
    name || "MP"
  )
    .trim()
    .split(/\s+/)
    .slice(0,2)
    .map(
      part =>
        part[0] || ""
    )
    .join("")
    .toUpperCase() ||
    "MP";
}

function safeAccent(value) {
  const color =
    String(
      value || ""
    ).trim();

  if (
    /^#[0-9a-f]{3}$/i
      .test(color) ||
    /^#[0-9a-f]{6}$/i
      .test(color)
  ) {
    return color;
  }

  return "var(--accent)";
}

function subtitle(key) {
  return (
    app.content[
      `${key}.subtitle`
    ] || ""
  );
}

function header(
  key,
  actions = ""
) {
  const description =
    subtitle(key);

  return `
    <div class="section-head">
      <div>
        <div class="kicker">
          Portal module
        </div>

        <h2>
          ${esc(
            pageTitles[key] ||
            key
          )}
        </h2>

        ${
          description
            ? `
              <p class="muted">
                ${esc(description)}
              </p>
            `
            : ""
        }
      </div>

      ${actions}
    </div>
  `;
}

function empty(message) {
  return `
    <div class="empty">
      ${esc(message)}
    </div>
  `;
}

function badge(value) {
  const text =
    String(
      value || ""
    );

  const lower =
    text.toLowerCase();

  const tone =
    [
      "active",
      "approved",
      "graded",
      "completed",
      "published"
    ].includes(lower)
      ? "success"
      : [
          "pending",
          "in_progress",
          "draft"
        ].includes(lower)
          ? "warning"
          : [
              "suspended",
              "failed",
              "rejected"
            ].includes(lower)
              ? "danger"
              : "";

  return `
    <span class="badge ${tone}">
      ${esc(text || "—")}
    </span>
  `;
}

function progressBar(value) {
  const number =
    Math.max(
      0,
      Math.min(
        100,
        Number(
          value || 0
        )
      )
    );

  return `
    <div class="progress">
      <span
        style="width:${number}%"
      ></span>
    </div>
  `;
}

function safeUrl(value) {
  try {
    const url =
      new URL(
        String(
          value || ""
        ),
        location.href
      );

    if (
      [
        "http:",
        "https:"
      ].includes(
        url.protocol
      )
    ) {
      return url.href;
    }
  } catch {}

  return "";
}

function toast(
  message,
  type = ""
) {
  const node =
    document.createElement(
      "div"
    );

  node.className =
    `toast ${type}`;

  node.textContent =
    message;

  document
    .getElementById(
      "toastStack"
    )
    .appendChild(node);

  setTimeout(
    () => node.remove(),
    4200
  );
}

function showModal(
  title,
  html
) {
  modalTitle.textContent =
    title;

  modalBody.innerHTML =
    html;

  modalBackdrop.hidden =
    false;
}

function closeModal() {
  modalBackdrop.hidden =
    true;

  modalBody.innerHTML =
    "";
}

function formObject(form) {
  const data = {};

  new FormData(form)
    .forEach(
      (
        value,
        key
      ) => {
        if (
          data[key] !==
          undefined
        ) {
          if (
            !Array.isArray(
              data[key]
            )
          ) {
            data[key] = [
              data[key]
            ];
          }

          data[key].push(
            value
          );
        } else {
          data[key] =
            value;
        }
      }
    );

  form
    .querySelectorAll(
      "input[type='checkbox'][name]"
    )
    .forEach(
      input =>
        data[
          input.name
        ] =
          input.checked
    );

  return data;
}

function setBusy(
  button,
  busy,
  text = "Saving..."
) {
  if (!button) {
    return;
  }

  if (busy) {
    button.dataset.originalText =
      button.textContent;

    button.disabled =
      true;

    button.textContent =
      text;
  } else {
    button.disabled =
      false;

    button.textContent =
      button.dataset
        .originalText ||
      button.textContent;
  }
}

async function api(
  action,
  payload = {}
) {
  const data =
    await window.portalApi(
      action,
      payload
    );

  if (!data) {
    throw new Error(
      "Session ended."
    );
  }

  return data;
}

function applySettings(
  settings =
    app.settings
) {
  app.settings =
    settings || {};

  document
    .documentElement
    .dataset
    .theme =
      settings.theme ||
      "light";

  document
    .documentElement
    .dataset
    .density =
      settings.density ||
      "comfortable";

  document
    .documentElement
    .dataset
    .reducedMotion =
      bool(
        settings
          .reducedMotion
      )
        ? "true"
        : "false";

  document
    .documentElement
    .dataset
    .highContrast =
      bool(
        settings
          .highContrast
      )
        ? "true"
        : "false";

  document
    .body
    .classList
    .toggle(
      "sidebar-collapsed",
      bool(
        settings
          .sidebarCollapsed
      )
    );

  document
    .getElementById(
      "sidebar"
    )
    .classList
    .toggle(
      "collapsed",
      bool(
        settings
          .sidebarCollapsed
      )
    );
}

function applyPermissions() {
  document
    .querySelectorAll(
      "[data-min-clearance]"
    )
    .forEach(
      element => {
        element.hidden =
          Number(
            app.user
              .clearance
          ) <
          Number(
            element
              .dataset
              .minClearance
          );
      }
    );
}

function updateShell() {
  document
    .getElementById(
      "sidebarName"
    )
    .textContent =
      app.user
        .displayName;

  document
    .getElementById(
      "sidebarRole"
    )
    .textContent =
      `${app.user.role} · Clearance ${app.user.clearance}`;

  document
    .getElementById(
      "sidebarAvatar"
    )
    .textContent =
      initials(
        app.user
          .displayName
      );

  applyPermissions();
}

function setActiveNav(page) {
  document
    .querySelectorAll(
      "[data-page]"
    )
    .forEach(
      button =>
        button.classList
          .toggle(
            "active",
            button
              .dataset
              .page ===
              page
          )
    );
}

async function navigate(
  page,
  replace = false
) {
  if (
    !pageTitles[
      page
    ]
  ) {
    page =
      "dashboard";
  }

  const button =
    document
      .querySelector(
        `[data-page="${CSS.escape(page)}"]`
      );

  if (
    button &&
    button.closest(
      "[hidden]"
    )
  ) {
    page =
      "dashboard";
  }

  if (
    app.page ===
      "restricted" &&
    page !==
      "restricted"
  ) {
    app.restrictedPassword =
      "";

    app.restrictedData =
      null;
  }

  app.page =
    page;

  app.lesson =
    null;

  app.quizId =
    "";

  pageTitle.textContent =
    pageTitles[
      page
    ];

  setActiveNav(
    page
  );

  if (replace) {
    history.replaceState(
      {},
      "",
      `#${page}`
    );
  } else {
    history.pushState(
      {},
      "",
      `#${page}`
    );
  }

  pageContent.innerHTML =
    `
      <div class="card">
        Loading...
      </div>
    `;

  try {
    await renderPage(
      page
    );
  } catch (error) {
    pageContent.innerHTML =
      `
        ${header(page)}

        <div class="alert error">
          ${esc(
            error.message ||
            "Could not load this page."
          )}
        </div>
      `;
  }
}

async function renderPage(
  page
) {
  const handlers = {
    dashboard:
      renderDashboard,

    training:
      renderTraining,

    grades:
      renderGrades,

    messages:
      renderMessages,

    notifications:
      renderNotifications,

    policies:
      renderPolicies,

    resources:
      renderResources,

    staff:
      renderStaff,

    onboarding:
      renderOnboarding,

    mentor:
      renderMentor,

    submissions:
      renderSubmissions,

    "staff-management":
      renderStaffManagement,

    curriculum:
      renderCurriculum,

    "onboarding-management":
      renderOnboardingManagement,

    restricted:
      renderRestricted,

    audit:
      renderAudit,

    accounts:
      renderAccounts,

    announcements:
      renderAnnouncements,

    "portal-content":
      renderPortalContent,

    "admin-tools":
      renderAdminTools,

    profile:
      renderProfile,

    settings:
      renderSettings,

    help:
      renderHelp
  };

  await handlers[
    page
  ]();
}

async function renderDashboard() {
  const data =
    await api(
      "dashboard"
    );

  const current =
    data.currentLesson;

  const announcements =
    app.announcements ||
    [];

  pageContent.innerHTML =
    `
      ${header("dashboard")}

      <div class="grid four">

        <div class="card">
          <div class="kicker">
            Lessons complete
          </div>

          <div class="stat">
            ${Number(
              data.stats
                .completedLessons ||
              0
            )}
            /
            ${Number(
              data.stats
                .totalLessons ||
              0
            )}
          </div>
        </div>

        <div class="card">
          <div class="kicker">
            Unread messages
          </div>

          <div class="stat">
            ${Number(
              data.stats
                .unreadMessages ||
              0
            )}
          </div>
        </div>

        <div class="card">
          <div class="kicker">
            Notifications
          </div>

          <div class="stat">
            ${Number(
              data.stats
                .unreadNotifications ||
              0
            )}
          </div>
        </div>

        <div class="card">
          <div class="kicker">
            Clearance
          </div>

          <div class="stat">
            ${Number(
              app.user
                .clearance
            )}
          </div>
        </div>

      </div>

      <div
        class="grid two"
        style="margin-top:16px"
      >

        <div class="card">

          <div class="card-header">
            <h3>
              Current lesson
            </h3>
          </div>

          ${
            current
              ? `
                <h3>
                  ${esc(
                    current.title
                  )}
                </h3>

                <p class="muted">
                  ${esc(
                    current
                      .description ||
                    ""
                  )}
                </p>

                ${progressBar(
                  current
                    .progress
                    ?.progress
                )}

                <div
                  class="button-row"
                  style="margin-top:12px"
                >
                  <button
                    class="btn primary"
                    data-action="open-lesson"
                    data-id="${esc(
                      current.id
                    )}"
                  >
                    Open Lesson
                  </button>
                </div>
              `
              : empty(
                  "No available lesson right now."
                )
          }

        </div>

        <div class="card">

          <div class="card-header">
            <h3>
              Announcements
            </h3>
          </div>

          ${
            announcements.length
              ? `
                <div class="list">
                  ${announcements
                    .map(
                      item => `
                        <div class="list-item">

                          <div class="list-item-main">

                            <h4>
                              ${esc(
                                item.title
                              )}
                            </h4>

                            <p>
                              ${esc(
                                item
                                  .description ||
                                ""
                              )}
                            </p>

                          </div>

                          ${
                            bool(
                              item.pinned
                            )
                              ? `
                                <span class="badge">
                                  Pinned
                                </span>
                              `
                              : ""
                          }

                        </div>
                      `
                    )
                    .join("")}
                </div>
              `
              : empty(
                  "No announcements."
                )
          }

        </div>

      </div>

      <div
        class="card"
        style="margin-top:16px"
      >

        <div class="card-header">
          <h3>
            Recent grades
          </h3>
        </div>

        ${renderGradeList(
          data.recentGrades ||
          []
        )}

      </div>
    `;
}

async function renderTraining() {
  const data =
    await api(
      "listLessons"
    );

  pageContent.innerHTML =
    `
      ${header("training")}

      <div class="lesson-grid">
        ${
          data.lessons.length
            ? data.lessons
                .map(
                  lesson => {
                    const locked =
                      !lesson
                        .access
                        ?.allowed;

                    return `
                      <article
                        class="card lesson-card ${locked ? "locked" : ""}"
                      >

                        <div class="card-header">

                          <div>

                            <div class="kicker">
                              Lesson ${esc(
                                lesson.order ||
                                ""
                              )}
                            </div>

                            <h3>
                              ${esc(
                                lesson.title
                              )}
                            </h3>

                          </div>

                          ${badge(
                            lesson
                              .progress
                              ?.status ||
                            "not_started"
                          )}

                        </div>

                        <p class="muted">
                          ${esc(
                            lesson
                              .description ||
                            ""
                          )}
                        </p>

                        ${progressBar(
                          lesson
                            .progress
                            ?.progress
                        )}

                        <p
                          class="muted"
                          style="margin-bottom:0"
                        >
                          ${
                            locked
                              ? esc(
                                  lesson
                                    .access
                                    .reason ||
                                  "Locked"
                                )
                              : `${Number(
                                  lesson
                                    .progress
                                    ?.progress ||
                                  0
                                )}% complete`
                          }
                        </p>

                        <div
                          class="button-row"
                          style="margin-top:12px"
                        >

                          <button
                            class="btn ${locked ? "" : "primary"}"
                            data-action="open-lesson"
                            data-id="${esc(
                              lesson.id
                            )}"
                            ${locked ? "disabled" : ""}
                          >
                            ${locked ? "Locked" : "Open Lesson"}
                          </button>

                        </div>

                      </article>
                    `;
                  }
                )
                .join("")
            : empty(
                "No lessons have been published yet."
              )
        }
      </div>
    `;
}

async function openLesson(
  id
) {
  await api(
    "startLesson",
    {
      lessonId: id
    }
  );

  const data =
    await api(
      "getLesson",
      {
        lessonId: id
      }
    );

  app.lesson =
    data;

  app.lessonPageId =
    data.progress
      ?.currentPageId ||
    data.pages[0]
      ?.id ||
    "";

  app.quizId =
    "";

  renderLessonReader();
}

function renderLessonReader() {
  const data =
    app.lesson;

  if (!data) {
    return;
  }

  const activePage =
    data.pages.find(
      page =>
        String(
          page.id
        ) ===
        String(
          app.lessonPageId
        )
    ) ||
    data.pages[0] ||
    null;

  const note =
    data.notes.find(
      item =>
        String(
          item.pageId ||
          ""
        ) ===
        String(
          activePage
            ?.id ||
          ""
        )
    ) ||
    {
      body: ""
    };

  const activeQuiz =
    data.quizzes.find(
      quiz =>
        String(
          quiz.id
        ) ===
        String(
          app.quizId
        )
    );

  pageTitle.textContent =
    data.lesson.title;

  pageContent.innerHTML =
    `
      <div class="section-head">

        <div>

          <button
            class="text-button"
            data-action="back-training"
            type="button"
          >
            ← Back to Training
          </button>

          <h2>
            ${esc(
              data.lesson.title
            )}
          </h2>

          <p class="muted">
            ${esc(
              data.lesson
                .description ||
              ""
            )}
          </p>

        </div>

        ${badge(
          data.progress
            ?.status ||
          "in_progress"
        )}

      </div>

      <div class="reader">

        <aside class="card reader-nav">

          <div class="kicker">
            Lesson pages
          </div>

          ${
            data.pages
              .map(
                page => `
                  <button
                    type="button"
                    data-action="lesson-page"
                    data-id="${esc(
                      page.id
                    )}"
                    class="${
                      String(
                        page.id
                      ) ===
                      String(
                        activePage
                          ?.id
                      )
                        ? "active"
                        : ""
                    }"
                  >
                    ${esc(
                      page.title
                    )}
                  </button>
                `
              )
              .join("") ||
            `
              <span class="muted">
                No pages yet.
              </span>
            `
          }

          <hr>

          <div class="kicker">
            Quizzes
          </div>

          ${
            data.quizzes
              .map(
                quiz => `
                  <button
                    type="button"
                    data-action="open-quiz"
                    data-id="${esc(
                      quiz.id
                    )}"
                    ${quiz.unlocked ? "" : "disabled"}
                  >
                    ${esc(
                      quiz.title
                    )}
                    ${quiz.unlocked ? "" : " · Locked"}
                  </button>
                `
              )
              .join("") ||
            `
              <span class="muted">
                No quizzes yet.
              </span>
            `
          }

        </aside>

        <div class="stack reader-body">

          ${
            activeQuiz
              ? renderQuiz(
                  activeQuiz,
                  note,
                  activePage
                )
              : activePage
                ? `
                  <article class="card">

                    <div class="kicker">
                      Lesson page
                    </div>

                    <h2>
                      ${esc(
                        activePage
                          .title
                      )}
                    </h2>

                    <div class="prose">
                      ${nl(
                        activePage
                          .body ||
                        ""
                      )}
                    </div>

                    <div
                      class="button-row"
                      style="margin-top:18px"
                    >

                      <button
                        class="btn primary"
                        data-action="complete-page"
                        data-id="${esc(
                          activePage.id
                        )}"
                      >
                        Mark Page Complete
                      </button>

                    </div>

                  </article>
                `
                : `
                  <div class="card">
                    ${empty(
                      "This lesson does not have any pages yet."
                    )}
                  </div>
                `
          }

          <div class="card">

            <h3>
              Notes
            </h3>

            <p class="muted">
              Your notes stay available while you take quizzes.
            </p>

            <textarea
              class="textarea"
              id="lessonNote"
            >${esc(
              note.body ||
              ""
            )}</textarea>

            <div
              class="button-row"
              style="margin-top:10px"
            >

              <button
                class="btn"
                data-action="save-note"
                data-page-id="${esc(
                  activePage
                    ?.id ||
                  ""
                )}"
              >
                Save Notes
              </button>

            </div>

          </div>

        </div>

      </div>
    `;
}

function renderQuiz(
  quiz
) {
  if (
    !quiz.unlocked
  ) {
    return `
      <div class="card">
        <div class="alert warning">
          This quiz is locked until your mentor unlocks it.
        </div>
      </div>
    `;
  }

  return `
    <form
      class="card"
      id="quizForm"
      data-quiz-id="${esc(
        quiz.id
      )}"
    >

      <div class="kicker">
        ${esc(
          quiz.kind === "final"
            ? "Final quiz"
            : "Knowledge check"
        )}
      </div>

      <h2>
        ${esc(
          quiz.title
        )}
      </h2>

      <p class="muted">
        Passing score:
        ${Number(
          quiz.passingScore ||
          80
        )}%
      </p>

      <div class="stack">

        ${quiz.questions
          .map(
            (
              question,
              index
            ) => `
              <div class="quiz-question">

                <strong>
                  ${index + 1}.
                  ${esc(
                    question.prompt
                  )}
                </strong>

                ${
                  question.type ===
                    "short_answer"
                    ? `
                      <textarea
                        class="textarea"
                        name="q_${esc(
                          question.id
                        )}"
                        required
                      ></textarea>
                    `
                    : `
                      <div class="quiz-options">

                        ${(question.options || [])
                          .map(
                            option => `
                              <label class="check">
                                <input
                                  type="radio"
                                  name="q_${esc(
                                    question.id
                                  )}"
                                  value="${esc(
                                    option
                                  )}"
                                  required
                                >
                                ${esc(
                                  option
                                )}
                              </label>
                            `
                          )
                          .join("")}

                      </div>
                    `
                }

              </div>
            `
          )
          .join("")}

      </div>

      <div
        class="button-row"
        style="margin-top:16px"
      >

        <button
          class="btn primary"
          type="submit"
        >
          Submit Quiz
        </button>

        <button
          class="btn"
          type="button"
          data-action="close-quiz"
        >
          Back to Lesson
        </button>

      </div>

    </form>
  `;
}

function renderGradeList(
  grades
) {
  if (
    !grades.length
  ) {
    return empty(
      "No grades yet."
    );
  }

  return `
    <div class="list">

      ${grades
        .map(
          grade => `
            <div class="list-item">

              <div>

                <strong>
                  ${esc(
                    grade.title
                  )}
                </strong>

                <p>
                  ${esc(
                    grade.feedback ||
                    "No feedback yet."
                  )}
                </p>

              </div>

              <div>

                ${badge(
                  grade.status
                )}

                <div
                  style="margin-top:6px;font-weight:800"
                >
                  ${
                    grade.score === ""
                      ? "—"
                      : `${Number(
                          grade.score
                        )}%`
                  }
                </div>

              </div>

            </div>
          `
        )
        .join("")}

    </div>
  `;
}

async function renderGrades() {
  const data =
    await api(
      "listGrades"
    );

  pageContent.innerHTML =
    `
      ${header("grades")}

      <div class="card">
        ${renderGradeList(
          data.grades ||
          []
        )}
      </div>
    `;
}

async function renderMessages() {
  const [
    messageData,
    staffData
  ] =
    await Promise.all([
      api(
        "listMessages"
      ),
      api(
        "listStaff"
      )
    ]);

  const recipients =
    staffData.staff.filter(
      user =>
        String(
          user.id
        ) !==
        String(
          app.user.id
        )
    );

  pageContent.innerHTML =
    `
      ${header("messages")}

      <div class="grid two">

        <form
          class="card"
          id="messageForm"
        >

          <h3>
            New message
          </h3>

          <div class="form-grid">

            <label class="field">
              Recipient

              <select
                name="recipientId"
                required
              >

                <option value="">
                  Select staff
                </option>

                ${recipients
                  .map(
                    user => `
                      <option
                        value="${esc(
                          user.id
                        )}"
                      >
                        ${esc(
                          user.displayName
                        )}
                        ·
                        C${Number(
                          user.clearance
                        )}
                      </option>
                    `
                  )
                  .join("")}

              </select>

            </label>

            <label class="field">
              Message

              <textarea
                name="body"
                required
              ></textarea>
            </label>

          </div>

          <button
            class="btn primary"
            type="submit"
          >
            Send Message
          </button>

        </form>

        <div class="card">

          <h3>
            Messages
          </h3>

          ${
            messageData
              .messages
              .length
              ? `
                <div class="list">

                  ${messageData
                    .messages
                    .map(
                      message => `
                        <div class="list-item">

                          <div>

                            <strong>
                              ${
                                String(
                                  message.senderId
                                ) ===
                                String(
                                  app.user.id
                                )
                                  ? `To ${esc(
                                      message.recipientName
                                    )}`
                                  : `From ${esc(
                                      message.senderName
                                    )}`
                              }
                            </strong>

                            <p>
                              ${esc(
                                message.body
                              )}
                            </p>

                            <p>
                              ${fmtDate(
                                message.createdAt
                              )}
                            </p>

                          </div>

                          ${
                            String(
                              message.recipientId
                            ) ===
                              String(
                                app.user.id
                              ) &&
                            !message.readAt
                              ? `
                                <button
                                  class="btn small"
                                  data-action="mark-message-read"
                                  data-id="${esc(
                                    message.id
                                  )}"
                                >
                                  Mark Read
                                </button>
                              `
                              : ""
                          }

                        </div>
                      `
                    )
                    .join("")}

                </div>
              `
              : empty(
                  "No messages yet."
                )
          }

        </div>

      </div>
    `;
}

async function renderNotifications() {
  const data =
    await api(
      "listNotifications"
    );

  pageContent.innerHTML =
    `
      ${header(
        "notifications",
        `
          <button
            class="btn"
            data-action="mark-all-notifications"
          >
            Mark All Read
          </button>
        `
      )}

      <div class="card">

        ${
          data.notifications.length
            ? `
              <div class="list">

                ${data.notifications
                  .map(
                    item => `
                      <div class="list-item">

                        <div>

                          <strong>
                            ${esc(
                              item.title
                            )}
                          </strong>

                          <p>
                            ${esc(
                              item.description ||
                              ""
                            )}
                          </p>

                          <p>
                            ${fmtDate(
                              item.createdAt
                            )}
                          </p>

                        </div>

                        ${
                          !bool(
                            item.read
                          )
                            ? `
                              <button
                                class="btn small"
                                data-action="mark-notification-read"
                                data-id="${esc(
                                  item.id
                                )}"
                              >
                                Mark Read
                              </button>
                            `
                            : badge(
                                "read"
                              )
                        }

                      </div>
                    `
                  )
                  .join("")}

              </div>
            `
            : empty(
                "No notifications."
              )
        }

      </div>
    `;
}

async function renderPolicies() {
  const data =
    await api(
      "listPolicies"
    );

  const canManage =
    Number(
      app.user
        .clearance
    ) >= 4;

  pageContent.innerHTML =
    `
      ${header("policies")}

      ${
        canManage
          ? `
            <form
              class="card"
              id="policyForm"
            >

              <h3>
                Create or edit policy
              </h3>

              <input
                type="hidden"
                name="id"
              >

              <div class="form-grid two">

                <label class="field">
                  Title
                  <input
                    name="title"
                    required
                  >
                </label>

                <label class="field">
                  Category
                  <input name="category">
                </label>

              </div>

              <label class="field">
                Description
                <textarea
                  name="description"
                ></textarea>
              </label>

              <label class="field">
                Policy body
                <textarea
                  name="body"
                  required
                ></textarea>
              </label>

              <div class="button-row">

                <label class="check">
                  <input
                    type="checkbox"
                    name="published"
                  >
                  Published
                </label>

                <label class="check">
                  <input
                    type="checkbox"
                    name="requiresAcknowledgement"
                  >
                  Requires acknowledgement
                </label>

                <button
                  class="btn primary"
                  type="submit"
                >
                  Save Policy
                </button>

                <button
                  class="btn"
                  type="reset"
                >
                  Clear
                </button>

              </div>

            </form>
          `
          : ""
      }

      <div
        class="card"
        style="margin-top:16px"
      >

        ${
          data.policies.length
            ? `
              <div class="list">

                ${data.policies
                  .map(
                    item => `
                      <div class="list-item">

                        <div class="list-item-main">

                          <div class="kicker">
                            ${esc(
                              item.category ||
                              "Policy"
                            )}
                          </div>

                          <h3>
                            ${esc(
                              item.title
                            )}
                          </h3>

                          <p>
                            ${esc(
                              item.description ||
                              ""
                            )}
                          </p>

                          <div
                            class="prose"
                            style="margin-top:10px"
                          >
                            ${nl(
                              item.body ||
                              ""
                            )}
                          </div>

                        </div>

                        <div class="stack">

                          ${
                            bool(
                              item
                                .requiresAcknowledgement
                            ) &&
                            !item
                              .acknowledged &&
                            bool(
                              item
                                .published
                            )
                              ? `
                                <button
                                  class="btn primary small"
                                  data-action="ack-policy"
                                  data-id="${esc(
                                    item.id
                                  )}"
                                >
                                  Acknowledge
                                </button>
                              `
                              : item
                                  .acknowledged
                                ? badge(
                                    "acknowledged"
                                  )
                                : ""
                          }

                          ${
                            canManage
                              ? `
                                <button
                                  class="btn small"
                                  data-action="edit-policy"
                                  data-id="${esc(
                                    item.id
                                  )}"
                                >
                                  Edit
                                </button>
                              `
                              : ""
                          }

                          ${
                            Number(
                              app.user
                                .clearance
                            ) >= 5
                              ? `
                                <button
                                  class="btn danger small"
                                  data-action="delete-policy"
                                  data-id="${esc(
                                    item.id
                                  )}"
                                >
                                  Delete
                                </button>
                              `
                              : ""
                          }

                        </div>

                      </div>
                    `
                  )
                  .join("")}

              </div>
            `
            : empty(
                "No policies have been published."
              )
        }

      </div>
    `;

  app.cachePolicies =
    data.policies;
}

async function renderResources() {
  const data =
    await api(
      "listResources"
    );

  const canManage =
    Number(
      app.user
        .clearance
    ) >= 4;

  pageContent.innerHTML =
    `
      ${header("resources")}

      ${
        canManage
          ? `
            <form
              class="card"
              id="resourceForm"
            >

              <h3>
                Create or edit resource
              </h3>

              <input
                type="hidden"
                name="id"
              >

              <div class="form-grid two">

                <label class="field">
                  Title
                  <input
                    name="title"
                    required
                  >
                </label>

                <label class="field">
                  Category
                  <input name="category">
                </label>

              </div>

              <label class="field">
                Description
                <textarea
                  name="description"
                ></textarea>
              </label>

              <label class="field">
                Link
                <input name="url">
              </label>

              ${
                Number(
                  app.user
                    .clearance
                ) >= 5
                  ? `
                    <label class="check">
                      <input
                        type="checkbox"
                        name="published"
                      >
                      Published
                    </label>
                  `
                  : `
                    <div class="alert warning">
                      Supervisor submissions are sent to an owner for approval.
                    </div>
                  `
              }

              <div class="button-row">

                <button
                  class="btn primary"
                  type="submit"
                >
                  Save Resource
                </button>

                <button
                  class="btn"
                  type="reset"
                >
                  Clear
                </button>

              </div>

            </form>
          `
          : ""
      }

      <div
        class="card"
        style="margin-top:16px"
      >

        ${
          data.resources.length
            ? `
              <div class="list">

                ${data.resources
                  .map(
                    item => {
                      const url =
                        safeUrl(
                          item.url
                        );

                      return `
                        <div class="list-item">

                          <div>

                            <div class="kicker">
                              ${esc(
                                item.category ||
                                "Resource"
                              )}
                            </div>

                            <h3>
                              ${esc(
                                item.title
                              )}
                            </h3>

                            <p>
                              ${esc(
                                item.description ||
                                ""
                              )}
                            </p>

                            ${
                              url
                                ? `
                                  <p>
                                    <a
                                      href="${esc(
                                        url
                                      )}"
                                      target="_blank"
                                      rel="noopener"
                                    >
                                      Open resource
                                    </a>
                                  </p>
                                `
                                : ""
                            }

                          </div>

                          <div class="stack">

                            ${badge(
                              item.status ||
                              (
                                bool(
                                  item
                                    .published
                                )
                                  ? "approved"
                                  : "draft"
                              )
                            )}

                            ${
                              Number(
                                app.user
                                  .clearance
                              ) >= 5 &&
                              String(
                                item.status
                              ) ===
                                "pending"
                                ? `
                                  <button
                                    class="btn primary small"
                                    data-action="approve-resource"
                                    data-id="${esc(
                                      item.id
                                    )}"
                                  >
                                    Approve
                                  </button>
                                `
                                : ""
                            }

                            ${
                              canManage
                                ? `
                                  <button
                                    class="btn small"
                                    data-action="edit-resource"
                                    data-id="${esc(
                                      item.id
                                    )}"
                                  >
                                    Edit
                                  </button>
                                `
                                : ""
                            }

                            ${
                              Number(
                                app.user
                                  .clearance
                              ) >= 5
                                ? `
                                  <button
                                    class="btn danger small"
                                    data-action="delete-resource"
                                    data-id="${esc(
                                      item.id
                                    )}"
                                  >
                                    Delete
                                  </button>
                                `
                                : ""
                            }

                          </div>

                        </div>
                      `;
                    }
                  )
                  .join("")}

              </div>
            `
            : empty(
                "No resources yet."
              )
        }

      </div>
    `;

  app.cacheResources =
    data.resources;
}

async function renderStaff() {
  const data =
    await api(
      "listStaff"
    );

  const clearanceLabels = {
    5: "Owners",
    4: "Supervisors",
    3: "Senior Staff",
    2: "Officers",
    1: "Cadets"
  };

  const groups =
    [5,4,3,2,1]
      .map(
        clearance => ({
          clearance,
          members:
            data.staff.filter(
              user =>
                Number(
                  user.clearance
                ) ===
                clearance
            )
        })
      )
      .filter(
        group =>
          group.members.length
      );

  pageContent.innerHTML =
    `
      ${header("staff")}

      ${
        groups.length
          ? groups
              .map(
                group => `
                  <section class="staff-section">

                    <div class="staff-section-title">
                      <h3>
                        ${esc(
                          clearanceLabels[
                            group.clearance
                          ]
                        )}
                      </h3>
                    </div>

                    <div class="staff-showcase-grid">

                      ${group.members
                        .map(
                          user => `
                            <article
                              class="staff-showcase-card"
                              style="--staff-accent:${safeAccent(
                                user
                                  .accentColor
                              )}"
                            >

                              <div class="staff-showcase-head">

                                <div
                                  class="staff-showcase-avatar"
                                  id="staffAvatar-${esc(
                                    user.id
                                  )}"
                                >
                                  ${esc(
                                    initials(
                                      user
                                        .displayName
                                    )
                                  )}
                                </div>

                                <div class="staff-showcase-name">

                                  <h3>
                                    ${esc(
                                      user
                                        .displayName
                                    )}
                                  </h3>

                                  <p>
                                    ${esc(
                                      user.roleTitle ||
                                      user.role
                                    )}
                                    ·
                                    Clearance
                                    ${Number(
                                      user
                                        .clearance
                                    )}
                                  </p>

                                  ${
                                    user.pronouns
                                      ? `
                                        <p>
                                          ${esc(
                                            user
                                              .pronouns
                                          )}
                                        </p>
                                      `
                                      : ""
                                  }

                                </div>

                              </div>

                              <div class="staff-showcase-body">

                                ${
                                  user.description
                                    ? `
                                      <p class="staff-showcase-description">
                                        ${esc(
                                          user
                                            .description
                                        )}
                                      </p>
                                    `
                                    : ""
                                }

                                ${
                                  user.bio
                                    ? `
                                      <p class="staff-showcase-bio">
                                        ${esc(
                                          user.bio
                                        )}
                                      </p>
                                    `
                                    : ""
                                }

                                ${
                                  user.availability ||
                                  user.askMeAbout
                                    ? `
                                      <div class="staff-showcase-details">

                                        ${
                                          user.availability
                                            ? `
                                              <div class="staff-showcase-detail">

                                                <strong>
                                                  Availability
                                                </strong>

                                                ${esc(
                                                  user
                                                    .availability
                                                )}

                                              </div>
                                            `
                                            : ""
                                        }

                                        ${
                                          user.askMeAbout
                                            ? `
                                              <div class="staff-showcase-detail">

                                                <strong>
                                                  Ask me about
                                                </strong>

                                                ${esc(
                                                  user
                                                    .askMeAbout
                                                )}

                                              </div>
                                            `
                                            : ""
                                        }

                                      </div>
                                    `
                                    : ""
                                }

                              </div>

                            </article>
                          `
                        )
                        .join("")}

                    </div>

                  </section>
                `
              )
              .join("")
          : empty(
              "No active staff accounts."
            )
      }
    `;

  data.staff
    .filter(
      user =>
        user.hasAvatar
    )
    .forEach(
      user =>
        loadAvatar(
          user.id,
          `staffAvatar-${user.id}`
        )
    );
}

async function renderOnboarding() {
  const data =
    await api(
      "listOnboarding"
    );

  pageContent.innerHTML =
    `
      ${header("onboarding")}

      <div class="card">

        ${
          data.steps.length
            ? `
              <div class="list">

                ${data.steps
                  .map(
                    step => `
                      <div class="list-item">

                        <div class="list-item-main">

                          <div class="kicker">
                            Step ${esc(
                              step.order ||
                              ""
                            )}
                            ${
                              bool(
                                step.required
                              )
                                ? " · Required"
                                : ""
                            }
                          </div>

                          <h3>
                            ${esc(
                              step.title
                            )}
                          </h3>

                          <p>
                            ${esc(
                              step.description ||
                              ""
                            )}
                          </p>

                          <div
                            class="prose"
                            style="margin-top:10px"
                          >
                            ${nl(
                              step.body ||
                              ""
                            )}
                          </div>

                        </div>

                        ${
                          step.completed
                            ? badge(
                                "completed"
                              )
                            : `
                              <button
                                class="btn primary small"
                                data-action="complete-onboarding"
                                data-id="${esc(
                                  step.id
                                )}"
                              >
                                Mark Complete
                              </button>
                            `
                        }

                      </div>
                    `
                  )
                  .join("")}

              </div>
            `
            : empty(
                "No onboarding steps have been published."
              )
        }

      </div>
    `;
}

async function renderMentor() {
  const data =
    await api(
      "getMentorDashboard"
    );

  pageContent.innerHTML =
    `
      ${header("mentor")}

      <div class="stack">

        ${
          data.cadets.length
            ? data.cadets
                .map(
                  cadet => `
                    <div class="card">

                      <div class="card-header">

                        <div>

                          <h3>
                            ${esc(
                              cadet
                                .displayName
                            )}
                          </h3>

                          <p class="muted">
                            @${esc(
                              cadet.username
                            )}
                          </p>

                        </div>

                      </div>

                      ${
                        cadet
                          .progress
                          .length
                          ? `
                            <div class="table-wrap">

                              <table>

                                <thead>
                                  <tr>
                                    <th>Lesson</th>
                                    <th>Status</th>
                                    <th>Progress</th>
                                    <th>Lesson Access</th>
                                    <th>Final Quiz</th>
                                  </tr>
                                </thead>

                                <tbody>

                                  ${cadet.progress
                                    .map(
                                      row => `
                                        <tr>

                                          <td>
                                            ${esc(
                                              row
                                                .lessonTitle
                                            )}
                                          </td>

                                          <td>
                                            ${badge(
                                              row.status
                                            )}
                                          </td>

                                          <td>
                                            ${Number(
                                              row.progress ||
                                              0
                                            )}%
                                          </td>

                                          <td>
                                            <button
                                              class="btn small"
                                              data-action="toggle-lesson-unlock"
                                              data-user-id="${esc(
                                                cadet.id
                                              )}"
                                              data-lesson-id="${esc(
                                                row.lessonId
                                              )}"
                                              data-value="${
                                                bool(
                                                  row
                                                    .mentorUnlock
                                                )
                                                  ? "false"
                                                  : "true"
                                              }"
                                            >
                                              ${
                                                bool(
                                                  row
                                                    .mentorUnlock
                                                )
                                                  ? "Relock"
                                                  : "Unlock"
                                              }
                                            </button>
                                          </td>

                                          <td>
                                            <button
                                              class="btn small"
                                              data-action="toggle-final-unlock"
                                              data-user-id="${esc(
                                                cadet.id
                                              )}"
                                              data-lesson-id="${esc(
                                                row.lessonId
                                              )}"
                                              data-value="${
                                                bool(
                                                  row
                                                    .finalQuizUnlocked
                                                )
                                                  ? "false"
                                                  : "true"
                                              }"
                                            >
                                              ${
                                                bool(
                                                  row
                                                    .finalQuizUnlocked
                                                )
                                                  ? "Relock"
                                                  : "Unlock"
                                              }
                                            </button>
                                          </td>

                                        </tr>
                                      `
                                    )
                                    .join("")}

                                </tbody>

                              </table>

                            </div>
                          `
                          : empty(
                              "No lessons configured."
                            )
                      }

                    </div>
                  `
                )
                .join("")
            : empty(
                "No cadets are assigned to you."
              )
        }

      </div>
    `;
}

async function renderSubmissions() {
  const data =
    await api(
      "listPendingSubmissions"
    );

  pageContent.innerHTML =
    `
      ${header("submissions")}

      <div class="stack">

        ${
          data.submissions.length
            ? data.submissions
                .map(
                  item => `
                    <form
                      class="card submission-form"
                      data-attempt-id="${esc(
                        item.id
                      )}"
                    >

                      <div class="card-header">

                        <div>

                          <h3>
                            ${esc(
                              item.userName
                            )}
                            ·
                            ${esc(
                              item.quizTitle
                            )}
                          </h3>

                          <p class="muted">
                            Submitted
                            ${fmtDate(
                              item.submittedAt
                            )}
                          </p>

                        </div>

                        ${badge(
                          item.status
                        )}

                      </div>

                      <div class="stack">

                        ${item.answers
                          .map(
                            answer => {
                              const q =
                                item.questions.find(
                                  question =>
                                    String(
                                      question.id
                                    ) ===
                                    String(
                                      answer
                                        .questionId
                                    )
                                );

                              return `
                                <div class="quiz-question">

                                  <strong>
                                    ${esc(
                                      q?.prompt ||
                                      "Question"
                                    )}
                                  </strong>

                                  <p>
                                    ${esc(
                                      answer.answer ||
                                      "No answer"
                                    )}
                                  </p>

                                </div>
                              `;
                            }
                          )
                          .join("")}

                      </div>

                      <div class="form-grid two">

                        <label class="field">
                          Final score

                          <input
                            name="score"
                            type="number"
                            min="0"
                            max="100"
                            required
                          >
                        </label>

                        <label class="field">
                          Feedback

                          <textarea
                            name="feedback"
                          ></textarea>
                        </label>

                      </div>

                      <button
                        class="btn primary"
                        type="submit"
                      >
                        Submit Grade
                      </button>

                    </form>
                  `
                )
                .join("")
            : empty(
                "No submissions are waiting for grading."
              )
        }

      </div>
    `;
}

async function renderStaffManagement() {
  const data =
    await api(
      "listAccounts"
    );

  const mentors =
    data.accounts.filter(
      user =>
        Number(
          user.clearance
        ) >= 2 &&
        user.status ===
          "active"
    );

  pageContent.innerHTML =
    `
      ${header(
        "staff-management"
      )}

      <div class="card">

        <div class="table-wrap">

          <table>

            <thead>
              <tr>
                <th>Staff</th>
                <th>Role</th>
                <th>Status</th>
                <th>Mentor</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              ${data.accounts
                .map(
                  user => `
                    <tr>

                      <td>
                        <strong>
                          ${esc(
                            user.displayName
                          )}
                        </strong>

                        <br>

                        <span class="muted">
                          @${esc(
                            user.username
                          )}
                        </span>
                      </td>

                      <td>
                        C${Number(
                          user.clearance
                        )}
                        ·
                        ${esc(
                          user.role
                        )}
                      </td>

                      <td>
                        ${badge(
                          user.status
                        )}
                      </td>

                      <td>

                        ${
                          Number(
                            user.clearance
                          ) === 1
                            ? `
                              <select
                                class="select mentor-select"
                                data-user-id="${esc(
                                  user.id
                                )}"
                              >

                                <option value="">
                                  Unassigned
                                </option>

                                ${mentors
                                  .map(
                                    mentor => `
                                      <option
                                        value="${esc(
                                          mentor.id
                                        )}"
                                        ${
                                          String(
                                            mentor.id
                                          ) ===
                                          String(
                                            user.mentorId
                                          )
                                            ? "selected"
                                            : ""
                                        }
                                      >
                                        ${esc(
                                          mentor
                                            .displayName
                                        )}
                                      </option>
                                    `
                                  )
                                  .join("")}

                              </select>
                            `
                            : "—"
                        }

                      </td>

                      <td>

                        <div class="button-row">

                          ${
                            Number(
                              user.clearance
                            ) === 1
                              ? `
                                <button
                                  class="btn small"
                                  data-action="save-mentor"
                                  data-user-id="${esc(
                                    user.id
                                  )}"
                                >
                                  Save Mentor
                                </button>
                              `
                              : ""
                          }

                          ${
                            user.status ===
                              "active" &&
                            String(
                              user.id
                            ) !==
                              String(
                                app.user.id
                              )
                              ? `
                                <button
                                  class="btn danger small"
                                  data-action="suspend-user"
                                  data-user-id="${esc(
                                    user.id
                                  )}"
                                >
                                  Suspend
                                </button>
                              `
                              : user.status ===
                                  "suspended"
                                ? `
                                  <button
                                    class="btn small"
                                    data-action="reactivate-user"
                                    data-user-id="${esc(
                                      user.id
                                    )}"
                                  >
                                    Reactivate
                                  </button>
                                `
                                : ""
                          }

                        </div>

                      </td>

                    </tr>
                  `
                )
                .join("")}

            </tbody>

          </table>

        </div>

      </div>
    `;
}

function curriculumSelect(
  items,
  selected = "",
  label = "Select"
) {
  return `
    <option value="">
      ${esc(label)}
    </option>

    ${items
      .map(
        item => `
          <option
            value="${esc(
              item.id
            )}"
            ${
              String(
                item.id
              ) ===
              String(
                selected
              )
                ? "selected"
                : ""
            }
          >
            ${esc(
              item.title
            )}
          </option>
        `
      )
      .join("")}
  `;
}

async function renderCurriculum() {
  const data =
    await api(
      "listCurriculum"
    );

  app.curriculum =
    data;

  const owner =
    Number(
      app.user
        .clearance
    ) >= 5;

  pageContent.innerHTML =
    `
      ${header("curriculum")}

      <div class="grid two">

        <form
          class="card"
          id="lessonForm"
        >

          <h3>
            Lesson
          </h3>

          <input
            type="hidden"
            name="id"
          >

          <div class="form-grid two">

            <label class="field">
              Title
              <input
                name="title"
                required
              >
            </label>

            <label class="field">
              Order
              <input
                name="order"
                type="number"
                value="1"
              >
            </label>

          </div>

          <label class="field">
            Description
            <textarea
              name="description"
            ></textarea>
          </label>

          <div class="form-grid two">

            <label class="field">
              Prerequisite

              <select name="prerequisiteId">
                ${curriculumSelect(
                  data.lessons,
                  "",
                  "None"
                )}
              </select>
            </label>

            <label class="field">
              Passing score

              <input
                name="passingScore"
                type="number"
                min="0"
                max="100"
                value="80"
              >
            </label>

          </div>

          <div class="button-row">

            <label class="check">
              <input
                type="checkbox"
                name="mentorUnlockRequired"
              >
              Mentor unlock required
            </label>

            <label class="check">
              <input
                type="checkbox"
                name="published"
              >
              Published
            </label>

          </div>

          <div class="button-row">

            <button
              class="btn primary"
              type="submit"
            >
              Save Lesson
            </button>

            <button
              class="btn"
              type="reset"
            >
              Clear
            </button>

          </div>

        </form>

        <form
          class="card"
          id="pageForm"
        >

          <h3>
            Lesson page
          </h3>

          <input
            type="hidden"
            name="id"
          >

          <div class="form-grid two">

            <label class="field">
              Lesson

              <select
                name="lessonId"
                required
              >
                ${curriculumSelect(
                  data.lessons
                )}
              </select>
            </label>

            <label class="field">
              Order

              <input
                name="order"
                type="number"
                value="1"
              >
            </label>

          </div>

          <label class="field">
            Title

            <input
              name="title"
              required
            >
          </label>

          <label class="field">
            Page content

            <textarea
              name="body"
              required
            ></textarea>
          </label>

          <div class="button-row">

            <button
              class="btn primary"
              type="submit"
            >
              Save Page
            </button>

            <button
              class="btn"
              type="reset"
            >
              Clear
            </button>

          </div>

        </form>

        <form
          class="card"
          id="quizEditorForm"
        >

          <h3>
            Quiz
          </h3>

          <input
            type="hidden"
            name="id"
          >

          <div class="form-grid two">

            <label class="field">
              Lesson

              <select
                name="lessonId"
                required
              >
                ${curriculumSelect(
                  data.lessons
                )}
              </select>
            </label>

            <label class="field">
              Lesson page

              <select name="pageId">
                ${curriculumSelect(
                  data.pages,
                  "",
                  "None / final"
                )}
              </select>
            </label>

          </div>

          <div class="form-grid three">

            <label class="field">
              Title
              <input
                name="title"
                required
              >
            </label>

            <label class="field">
              Order
              <input
                name="order"
                type="number"
                value="1"
              >
            </label>

            <label class="field">
              Kind

              <select name="kind">
                <option value="check">
                  Knowledge check
                </option>

                <option value="final">
                  Final quiz
                </option>
              </select>
            </label>

          </div>

          <label class="field">
            Passing score

            <input
              name="passingScore"
              type="number"
              min="0"
              max="100"
              value="80"
            >
          </label>

          <div class="button-row">

            <label class="check">
              <input
                type="checkbox"
                name="mentorUnlockRequired"
              >
              Mentor unlock required
            </label>

            <label class="check">
              <input
                type="checkbox"
                name="published"
              >
              Published
            </label>

          </div>

          <div class="button-row">

            <button
              class="btn primary"
              type="submit"
            >
              Save Quiz
            </button>

            <button
              class="btn"
              type="reset"
            >
              Clear
            </button>

          </div>

        </form>

        <form
          class="card"
          id="questionForm"
        >

          <h3>
            Quiz question
          </h3>

          <input
            type="hidden"
            name="id"
          >

          <div class="form-grid two">

            <label class="field">
              Quiz

              <select
                name="quizId"
                required
              >
                ${curriculumSelect(
                  data.quizzes
                )}
              </select>
            </label>

            <label class="field">
              Type

              <select name="type">
                <option value="multiple_choice">
                  Multiple choice
                </option>

                <option value="short_answer">
                  Short answer
                </option>
              </select>
            </label>

          </div>

          <label class="field">
            Question

            <textarea
              name="prompt"
              required
            ></textarea>
          </label>

          <label class="field">
            Choices

            <textarea
              name="options"
              placeholder="One choice per line"
            ></textarea>
          </label>

          <div class="form-grid two">

            <label class="field">
              Correct answer
              <input name="correctAnswer">
            </label>

            <label class="field">
              Points
              <input
                name="points"
                type="number"
                min="1"
                value="1"
              >
            </label>

          </div>

          <label class="field">
            Explanation

            <textarea
              name="explanation"
            ></textarea>
          </label>

          <div class="button-row">

            <label class="check">
              <input
                type="checkbox"
                name="published"
                checked
              >
              Published
            </label>

          </div>

          <div class="button-row">

            <button
              class="btn primary"
              type="submit"
            >
              Save Question
            </button>

            <button
              class="btn"
              type="reset"
            >
              Clear
            </button>

          </div>

        </form>

      </div>

      <div
        class="stack"
        style="margin-top:16px"
      >

        <div class="card">
          <h3>Lessons</h3>
          ${curriculumTable(
            "lesson",
            data.lessons,
            owner
          )}
        </div>

        <div class="card">
          <h3>Lesson pages</h3>
          ${curriculumTable(
            "page",
            data.pages,
            owner
          )}
        </div>

        <div class="card">
          <h3>Quizzes</h3>
          ${curriculumTable(
            "quiz",
            data.quizzes,
            owner
          )}
        </div>

        <div class="card">
          <h3>Questions</h3>
          ${curriculumTable(
            "question",
            data.questions,
            owner
          )}
        </div>

      </div>
    `;
}

function curriculumTable(
  type,
  items,
  owner
) {
  if (!items.length) {
    return empty(
      `No ${type}s yet.`
    );
  }

  return `
    <div class="table-wrap">

      <table>

        <thead>
          <tr>
            <th>Title</th>
            <th>Order</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>

          ${items
            .map(
              item => `
                <tr>

                  <td>
                    ${esc(
                      item.title ||
                      item.prompt ||
                      "Untitled"
                    )}
                  </td>

                  <td>
                    ${esc(
                      item.order ||
                      ""
                    )}
                  </td>

                  <td>
                    ${
                      item.published ===
                        undefined
                        ? "—"
                        : badge(
                            bool(
                              item
                                .published
                            )
                              ? "published"
                              : "draft"
                          )
                    }
                  </td>

                  <td>

                    <div class="button-row">

                      <button
                        class="btn small"
                        data-action="edit-curriculum"
                        data-type="${type}"
                        data-id="${esc(
                          item.id
                        )}"
                      >
                        Edit
                      </button>

                      ${
                        owner
                          ? `
                            <button
                              class="btn danger small"
                              data-action="delete-curriculum"
                              data-type="${type}"
                              data-id="${esc(
                                item.id
                              )}"
                            >
                              Delete
                            </button>
                          `
                          : ""
                      }

                    </div>

                  </td>

                </tr>
              `
            )
            .join("")}

        </tbody>

      </table>

    </div>
  `;
}

async function renderOnboardingManagement() {
  const data =
    await api(
      "listOnboardingAdmin"
    );

  app.cacheOnboarding =
    data.steps;

  pageContent.innerHTML =
    `
      ${header(
        "onboarding-management"
      )}

      <form
        class="card"
        id="onboardingAdminForm"
      >

        <h3>
          Onboarding step
        </h3>

        <input
          type="hidden"
          name="id"
        >

        <div class="form-grid two">

          <label class="field">
            Title
            <input
              name="title"
              required
            >
          </label>

          <label class="field">
            Order
            <input
              name="order"
              type="number"
              value="1"
            >
          </label>

        </div>

        <label class="field">
          Description

          <textarea
            name="description"
          ></textarea>
        </label>

        <label class="field">
          Step content

          <textarea
            name="body"
            required
          ></textarea>
        </label>

        <div class="button-row">

          <label class="check">
            <input
              type="checkbox"
              name="required"
              checked
            >
            Required
          </label>

          <label class="check">
            <input
              type="checkbox"
              name="published"
            >
            Published
          </label>

          <button
            class="btn primary"
            type="submit"
          >
            Save Step
          </button>

          <button
            class="btn"
            type="reset"
          >
            Clear
          </button>

        </div>

      </form>

      <div
        class="card"
        style="margin-top:16px"
      >

        ${
          data.steps.length
            ? `
              <div class="table-wrap">

                <table>

                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Title</th>
                      <th>Required</th>
                      <th>Published</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>

                    ${data.steps
                      .map(
                        step => `
                          <tr>

                            <td>
                              ${Number(
                                step.order ||
                                0
                              )}
                            </td>

                            <td>
                              ${esc(
                                step.title
                              )}
                            </td>

                            <td>
                              ${
                                bool(
                                  step.required
                                )
                                  ? "Yes"
                                  : "No"
                              }
                            </td>

                            <td>
                              ${
                                bool(
                                  step.published
                                )
                                  ? "Yes"
                                  : "No"
                              }
                            </td>

                            <td>

                              <div class="button-row">

                                <button
                                  class="btn small"
                                  data-action="edit-onboarding-admin"
                                  data-id="${esc(
                                    step.id
                                  )}"
                                >
                                  Edit
                                </button>

                                ${
                                  Number(
                                    app.user
                                      .clearance
                                  ) >= 5
                                    ? `
                                      <button
                                        class="btn danger small"
                                        data-action="delete-onboarding-admin"
                                        data-id="${esc(
                                          step.id
                                        )}"
                                      >
                                        Delete
                                      </button>
                                    `
                                    : ""
                                }

                              </div>

                            </td>

                          </tr>
                        `
                      )
                      .join("")}

                  </tbody>

                </table>

              </div>
            `
            : empty(
                "No onboarding steps yet."
              )
        }

      </div>
    `;
}

async function renderRestricted() {
  if (
    !app.restrictedPassword
  ) {
    pageContent.innerHTML =
      `
        ${header("restricted")}

        <form
          class="card"
          id="restrictedUnlockForm"
        >

          <h3>
            Confirm your password
          </h3>

          <label class="field">
            Password

            <input
              name="password"
              type="password"
              autocomplete="current-password"
              required
            >
          </label>

          <button
            class="btn primary"
            type="submit"
          >
            Unlock Restricted Records
          </button>

        </form>
      `;

    return;
  }

  const data =
    app.restrictedData ||
    await api(
      "listRestricted",
      {
        password:
          app.restrictedPassword
      }
    );

  app.restrictedData =
    data;

  pageContent.innerHTML =
    `
      ${header(
        "restricted",
        `
          <button
            class="btn"
            data-action="lock-restricted"
          >
            Lock Records
          </button>
        `
      )}

      <form
        class="card"
        id="restrictedForm"
      >

        <h3>
          Create or edit restricted record
        </h3>

        <input
          type="hidden"
          name="id"
        >

        <div class="form-grid two">

          <label class="field">
            Title

            <input
              name="title"
              required
            >
          </label>

          <label class="field">
            Immutable User ID

            <input
              name="userId"
              required
            >
          </label>

        </div>

        <label class="field">
          Status
          <input name="status">
        </label>

        <label class="field">
          Reasons / description

          <textarea
            name="description"
          ></textarea>
        </label>

        <label class="field">
          Extra notes

          <textarea
            name="extraNotes"
          ></textarea>
        </label>

        <label class="field">
          Evidence files

          <input
            id="restrictedFiles"
            type="file"
            multiple
          >
        </label>

        <div class="button-row">

          <button
            class="btn primary"
            type="submit"
          >
            Save Record
          </button>

          <button
            class="btn"
            type="reset"
            data-action="clear-restricted-form"
          >
            Clear
          </button>

        </div>

      </form>

      <div
        class="grid two"
        style="margin-top:16px"
      >

        <div class="card">

          <h3>
            Records
          </h3>

          ${
            data.records.length
              ? `
                <div class="list">

                  ${data.records
                    .map(
                      record => `
                        <div class="list-item">

                          <div>

                            <strong>
                              ${esc(
                                record.title
                              )}
                            </strong>

                            <p>
                              User ID:
                              ${esc(
                                record.userId
                              )}
                            </p>

                            <p>
                              ${esc(
                                record.description ||
                                ""
                              )}
                            </p>

                            <p>
                              ${fmtDate(
                                record.createdAt
                              )}
                            </p>

                          </div>

                          <div class="button-row">

                            <button
                              class="btn small"
                              data-action="view-restricted"
                              data-id="${esc(
                                record.id
                              )}"
                            >
                              View
                            </button>

                            <button
                              class="btn small"
                              data-action="edit-restricted"
                              data-id="${esc(
                                record.id
                              )}"
                            >
                              Edit
                            </button>

                          </div>

                        </div>
                      `
                    )
                    .join("")}

                </div>
              `
              : empty(
                  "No restricted records."
                )
          }

        </div>

        <div class="card">

          <h3>
            Access log
          </h3>

          ${
            data.accessLog.length
              ? `
                <div class="list">

                  ${data.accessLog
                    .map(
                      entry => `
                        <div class="list-item">

                          <div>

                            <strong>
                              ${esc(
                                entry.viewerName
                              )}
                            </strong>

                            <p>
                              ${esc(
                                entry.action
                              )}
                              ·
                              ${fmtDate(
                                entry.time
                              )}
                            </p>

                          </div>

                        </div>
                      `
                    )
                    .join("")}

                </div>
              `
              : empty(
                  "No access log entries."
                )
          }

        </div>

      </div>
    `;
}

async function renderAudit() {
  const data =
    await api(
      "listAudit"
    );

  pageContent.innerHTML =
    `
      ${header("audit")}

      <div class="card">

        <div class="table-wrap">

          <table>

            <thead>
              <tr>
                <th>Time</th>
                <th>User</th>
                <th>Action</th>
                <th>Target</th>
                <th>Details</th>
              </tr>
            </thead>

            <tbody>

              ${data.entries
                .map(
                  item => `
                    <tr>

                      <td>
                        ${fmtDate(
                          item.time
                        )}
                      </td>

                      <td>
                        ${esc(
                          item.userName
                        )}
                      </td>

                      <td>
                        ${esc(
                          item.action
                        )}
                      </td>

                      <td>
                        ${esc(
                          item.targetType
                        )}
                        ${esc(
                          item.targetId
                        )}
                      </td>

                      <td>
                        ${esc(
                          item.details ||
                          ""
                        )}
                      </td>

                    </tr>
                  `
                )
                .join("")}

            </tbody>

          </table>

        </div>

      </div>
    `;
}

async function renderAccounts() {
  const data =
    await api(
      "listAccounts"
    );

  app.cacheAccounts =
    data.accounts;

  const owner =
    Number(
      app.user
        .clearance
    ) >= 5;

  pageContent.innerHTML =
    `
      ${header("accounts")}

      <form
        class="card"
        id="createAccountForm"
      >

        <h3>
          Create account
        </h3>

        <div class="form-grid three">

          <label class="field">
            Username

            <input
              name="username"
              required
            >
          </label>

          <label class="field">
            Display name

            <input
              name="displayName"
              required
            >
          </label>

          <label class="field">
            Temporary password

            <input
              name="password"
              type="password"
              minlength="10"
              required
            >
          </label>

        </div>

        <div class="form-grid two">

          <label class="field">
            Clearance

            <select name="clearance">

              ${[1,2,3,4,5]
                .map(
                  level => `
                    <option
                      value="${level}"
                      ${
                        !owner &&
                        level > 3
                          ? "disabled"
                          : ""
                      }
                    >
                      ${level}
                    </option>
                  `
                )
                .join("")}

            </select>

          </label>

          <label class="check">

            <input
              type="checkbox"
              name="forcePasswordReset"
              checked
            >

            Force password change on first login

          </label>

        </div>

        <button
          class="btn primary"
          type="submit"
        >
          Create Account
        </button>

      </form>

      <div
        class="card"
        style="margin-top:16px"
      >

        <div class="table-wrap">

          <table>

            <thead>
              <tr>
                <th>Account</th>
                <th>Clearance</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              ${data.accounts
                .map(
                  user => `
                    <tr>

                      <td>
                        <strong>
                          ${esc(
                            user.displayName
                          )}
                        </strong>

                        <br>

                        <span class="muted">
                          @${esc(
                            user.username
                          )}
                        </span>
                      </td>

                      <td>
                        ${
                          owner &&
                          String(
                            user.id
                          ) !==
                            String(
                              app.user.id
                            )
                            ? `
                              <select
                                class="select clearance-select"
                                data-user-id="${esc(
                                  user.id
                                )}"
                              >

                                ${[1,2,3,4,5]
                                  .map(
                                    level => `
                                      <option
                                        value="${level}"
                                        ${
                                          Number(
                                            user.clearance
                                          ) === level
                                            ? "selected"
                                            : ""
                                        }
                                      >
                                        ${level}
                                      </option>
                                    `
                                  )
                                  .join("")}

                              </select>
                            `
                            : `
                              C${Number(
                                user.clearance
                              )}
                              ·
                              ${esc(
                                user.role
                              )}
                            `
                        }
                      </td>

                      <td>
                        ${badge(
                          user.status
                        )}
                      </td>

                      <td>
                        ${fmtDate(
                          user.createdAt
                        )}
                      </td>

                      <td>

                        <div class="button-row">

                          ${
                            user.status ===
                              "pending"
                              ? `
                                <button
                                  class="btn primary small"
                                  data-action="approve-account"
                                  data-user-id="${esc(
                                    user.id
                                  )}"
                                >
                                  Approve
                                </button>

                                <button
                                  class="btn danger small"
                                  data-action="reject-account"
                                  data-user-id="${esc(
                                    user.id
                                  )}"
                                >
                                  Reject
                                </button>
                              `
                              : ""
                          }

                          <button
                            class="btn small"
                            data-action="reset-password"
                            data-user-id="${esc(
                              user.id
                            )}"
                          >
                            Reset Password
                          </button>

                          ${
                            owner &&
                            String(
                              user.id
                            ) !==
                              String(
                                app.user.id
                              )
                              ? `
                                <button
                                  class="btn small"
                                  data-action="save-clearance"
                                  data-user-id="${esc(
                                    user.id
                                  )}"
                                >
                                  Save Clearance
                                </button>
                              `
                              : ""
                          }

                        </div>

                      </td>

                    </tr>
                  `
                )
                .join("")}

            </tbody>

          </table>

        </div>

      </div>
    `;
}

async function renderAnnouncements() {
  const data =
    await api(
      "listAnnouncements"
    );

  app.cacheAnnouncements =
    data.announcements;

  pageContent.innerHTML =
    `
      ${header(
        "announcements"
      )}

      <form
        class="card"
        id="announcementForm"
      >

        <h3>
          Announcement
        </h3>

        <input
          type="hidden"
          name="id"
        >

        <label class="field">
          Title

          <input
            name="title"
            required
          >
        </label>

        <label class="field">
          Announcement

          <textarea
            name="description"
            required
          ></textarea>
        </label>

        <div class="button-row">

          <label class="check">
            <input
              type="checkbox"
              name="pinned"
            >
            Pinned
          </label>

          <label class="check">
            <input
              type="checkbox"
              name="published"
            >
            Published
          </label>

          <button
            class="btn primary"
            type="submit"
          >
            Save Announcement
          </button>

          <button
            class="btn"
            type="reset"
          >
            Clear
          </button>

        </div>

      </form>

      <div
        class="card"
        style="margin-top:16px"
      >

        ${
          data.announcements.length
            ? `
              <div class="list">

                ${data.announcements
                  .map(
                    item => `
                      <div class="list-item">

                        <div>

                          <strong>
                            ${esc(
                              item.title
                            )}
                          </strong>

                          <p>
                            ${esc(
                              item.description
                            )}
                          </p>

                        </div>

                        <div class="button-row">

                          ${badge(
                            bool(
                              item.published
                            )
                              ? "published"
                              : "draft"
                          )}

                          <button
                            class="btn small"
                            data-action="edit-announcement"
                            data-id="${esc(
                              item.id
                            )}"
                          >
                            Edit
                          </button>

                          <button
                            class="btn danger small"
                            data-action="delete-announcement"
                            data-id="${esc(
                              item.id
                            )}"
                          >
                            Delete
                          </button>

                        </div>

                      </div>
                    `
                  )
                  .join("")}

              </div>
            `
            : empty(
                "No announcements yet."
              )
        }

      </div>
    `;
}

async function renderPortalContent() {
  const data =
    await api(
      "getContent"
    );

  pageContent.innerHTML =
    `
      ${header(
        "portal-content"
      )}

      <div class="card">

        <div class="stack">

          ${data.content
            .map(
              item => `
                <form
                  class="content-editor-row content-form"
                  data-key="${esc(
                    item.key
                  )}"
                >

                  <strong>
                    ${esc(
                      item.key
                    )}
                  </strong>

                  <div>

                    <textarea
                      class="textarea"
                      name="value"
                    >${esc(
                      item.value ||
                      ""
                    )}</textarea>

                    <button
                      class="btn small"
                      type="submit"
                    >
                      Save
                    </button>

                  </div>

                </form>
              `
            )
            .join("")}

        </div>

      </div>
    `;
}

async function renderAdminTools() {
  const data =
    await api(
      "getAdminStats"
    );

  pageContent.innerHTML =
    `
      ${header(
        "admin-tools"
      )}

      <div class="grid four">

        <div class="card">
          <div class="kicker">
            Users
          </div>
          <div class="stat">
            ${Number(
              data.stats.users
            )}
          </div>
        </div>

        <div class="card">
          <div class="kicker">
            Active sessions
          </div>
          <div class="stat">
            ${Number(
              data.stats
                .activeSessions
            )}
          </div>
        </div>

        <div class="card">
          <div class="kicker">
            Lessons
          </div>
          <div class="stat">
            ${Number(
              data.stats.lessons
            )}
          </div>
        </div>

        <div class="card">
          <div class="kicker">
            Quizzes
          </div>
          <div class="stat">
            ${Number(
              data.stats.quizzes
            )}
          </div>
        </div>

      </div>

      <div
        class="grid two"
        style="margin-top:16px"
      >

        <form
          class="card"
          id="maintenanceForm"
        >

          <h3>
            Maintenance mode
          </h3>

          <label class="check">

            <input
              type="checkbox"
              name="enabled"
              ${
                data.stats
                  .maintenance
                  ? "checked"
                  : ""
              }
            >

            Enabled

          </label>

          <label class="field">
            Message

            <textarea
              name="message"
            >${esc(
              data
                .maintenanceMessage ||
              ""
            )}</textarea>
          </label>

          <button
            class="btn primary"
            type="submit"
          >
            Save Maintenance State
          </button>

        </form>

        <div class="card">

          <h3>
            System tools
          </h3>

          <div class="button-row">

            <button
              class="btn"
              data-action="cleanup-sessions"
            >
              Clean Expired Sessions
            </button>

            <button
              class="btn"
              data-action="backup-database"
            >
              Create Database Backup
            </button>

          </div>

        </div>

      </div>
    `;
}

async function renderProfile() {
  const data =
    await api(
      "getProfile"
    );

  const profile =
    data.profile;

  pageContent.innerHTML =
    `
      ${header("profile")}

      <div class="grid two">

        <form
          class="card"
          id="profileForm"
        >

          <h3>
            Profile details
          </h3>

          <div class="form-grid two">

            <label class="field">
              Display name

              <input
                name="displayName"
                value="${esc(
                  profile.displayName
                )}"
                required
              >
            </label>

            <label class="field">
              Pronouns

              <input
                name="pronouns"
                value="${esc(
                  profile.pronouns ||
                  ""
                )}"
              >
            </label>

            <label class="field">
              Role title

              <input
                name="roleTitle"
                value="${esc(
                  profile.roleTitle ||
                  ""
                )}"
              >
            </label>

            <label class="field">
              Timezone

              <input
                name="timezone"
                value="${esc(
                  profile.timezone ||
                  ""
                )}"
              >
            </label>

          </div>

          <label class="field">
            Short description

            <textarea
              name="description"
            >${esc(
              profile.description ||
              ""
            )}</textarea>
          </label>

          <label class="field">
            Bio

            <textarea
              name="bio"
            >${esc(
              profile.bio ||
              ""
            )}</textarea>
          </label>

          <label class="field">
            Ask me about

            <textarea
              name="askMeAbout"
            >${esc(
              profile.askMeAbout ||
              ""
            )}</textarea>
          </label>

          <label class="field">
            Availability

            <textarea
              name="availability"
            >${esc(
              profile.availability ||
              ""
            )}</textarea>
          </label>

          <label class="field">
            Accent color

            <input
              name="accentColor"
              value="${esc(
                profile.accentColor ||
                ""
              )}"
              placeholder="#586d5b"
            >
          </label>

          <button
            class="btn primary"
            type="submit"
          >
            Save Profile
          </button>

        </form>

        <form
          class="card"
          id="avatarForm"
        >

          <h3>
            Profile picture
          </h3>

          <div
            class="avatar"
            id="profileAvatar"
            style="width:96px;height:96px;font-size:28px"
          >
            ${esc(
              initials(
                profile.displayName
              )
            )}
          </div>

          <label class="field">
            Upload image

            <input
              type="file"
              name="avatar"
              accept="image/*"
              required
            >
          </label>

          <button
            class="btn"
            type="submit"
          >
            Upload Picture
          </button>

        </form>

      </div>
    `;

  if (
    profile.hasAvatar
  ) {
    loadAvatar(
      profile.id,
      "profileAvatar"
    );
  }
}

async function renderSettings() {
  const data =
    await api(
      "getUserSettings"
    );

  const settings =
    data.settings;

  pageContent.innerHTML =
    `
      ${header("settings")}

      <div class="grid two">

        <form
          class="card"
          id="settingsForm"
        >

          <h3>
            Appearance & accessibility
          </h3>

          <div class="form-grid two">

            <label class="field">
              Theme

              <select name="theme">

                <option
                  value="light"
                  ${
                    settings.theme ===
                      "light"
                      ? "selected"
                      : ""
                  }
                >
                  Light
                </option>

                <option
                  value="dark"
                  ${
                    settings.theme ===
                      "dark"
                      ? "selected"
                      : ""
                  }
                >
                  Dark
                </option>

              </select>

            </label>

            <label class="field">
              Density

              <select name="density">

                <option
                  value="comfortable"
                  ${
                    settings.density ===
                      "comfortable"
                      ? "selected"
                      : ""
                  }
                >
                  Comfortable
                </option>

                <option
                  value="compact"
                  ${
                    settings.density ===
                      "compact"
                      ? "selected"
                      : ""
                  }
                >
                  Compact
                </option>

              </select>

            </label>

          </div>

          <div class="stack">

            <label class="check">
              <input
                type="checkbox"
                name="sidebarCollapsed"
                ${
                  bool(
                    settings
                      .sidebarCollapsed
                  )
                    ? "checked"
                    : ""
                }
              >
              Collapsed sidebar
            </label>

            <label class="check">
              <input
                type="checkbox"
                name="reducedMotion"
                ${
                  bool(
                    settings
                      .reducedMotion
                  )
                    ? "checked"
                    : ""
                }
              >
              Reduced motion
            </label>

            <label class="check">
              <input
                type="checkbox"
                name="highContrast"
                ${
                  bool(
                    settings
                      .highContrast
                  )
                    ? "checked"
                    : ""
                }
              >
              High contrast
            </label>

            <label class="check">
              <input
                type="checkbox"
                name="portalNotifications"
                ${
                  bool(
                    settings
                      .portalNotifications
                  )
                    ? "checked"
                    : ""
                }
              >
              Portal notifications
            </label>

            <label class="check">
              <input
                type="checkbox"
                name="messageNotifications"
                ${
                  bool(
                    settings
                      .messageNotifications
                  )
                    ? "checked"
                    : ""
                }
              >
              Message notifications
            </label>

          </div>

          <button
            class="btn primary"
            type="submit"
            style="margin-top:14px"
          >
            Save Settings
          </button>

        </form>

        <form
          class="card"
          id="passwordForm"
        >

          <h3>
            Change password
          </h3>

          <label class="field">
            Current password

            <input
              name="currentPassword"
              type="password"
              required
            >
          </label>

          <label class="field">
            New password

            <input
              name="newPassword"
              type="password"
              minlength="10"
              required
            >
          </label>

          <button
            class="btn primary"
            type="submit"
          >
            Change Password
          </button>

          <button
            class="btn"
            data-action="logout-all"
            type="button"
          >
            Sign Out Everywhere
          </button>

        </form>

      </div>
    `;
}

async function renderHelp() {
  const data =
    await api(
      "listHelp"
    );

  const owner =
    Number(
      app.user
        .clearance
    ) >= 5;

  app.cacheHelp =
    data.help;

  pageContent.innerHTML =
    `
      ${header("help")}

      ${
        owner
          ? `
            <form
              class="card"
              id="helpForm"
            >

              <h3>
                Help entry
              </h3>

              <input
                type="hidden"
                name="id"
              >

              <label class="field">
                Title

                <input
                  name="title"
                  required
                >
              </label>

              <label class="field">
                Description

                <textarea
                  name="description"
                ></textarea>
              </label>

              <label class="field">
                Body

                <textarea
                  name="body"
                  required
                ></textarea>
              </label>

              <label class="check">
                <input
                  type="checkbox"
                  name="published"
                >
                Published
              </label>

              <div class="button-row">

                <button
                  class="btn primary"
                  type="submit"
                >
                  Save Entry
                </button>

                <button
                  class="btn"
                  type="reset"
                >
                  Clear
                </button>

              </div>

            </form>
          `
          : ""
      }

      <div
        class="card"
        style="margin-top:16px"
      >

        ${
          data.help.length
            ? `
              <div class="list">

                ${data.help
                  .map(
                    item => `
                      <div class="list-item">

                        <div class="list-item-main">

                          <h3>
                            ${esc(
                              item.title
                            )}
                          </h3>

                          <p>
                            ${esc(
                              item.description ||
                              ""
                            )}
                          </p>

                          <div
                            class="prose"
                            style="margin-top:10px"
                          >
                            ${nl(
                              item.body ||
                              ""
                            )}
                          </div>

                        </div>

                        ${
                          owner
                            ? `
                              <div class="button-row">

                                <button
                                  class="btn small"
                                  data-action="edit-help"
                                  data-id="${esc(
                                    item.id
                                  )}"
                                >
                                  Edit
                                </button>

                                <button
                                  class="btn danger small"
                                  data-action="delete-help"
                                  data-id="${esc(
                                    item.id
                                  )}"
                                >
                                  Delete
                                </button>

                              </div>
                            `
                            : ""
                        }

                      </div>
                    `
                  )
                  .join("")}

              </div>
            `
            : empty(
                "No help entries have been published."
              )
        }

      </div>
    `;
}

async function loadAvatar(
  userId,
  elementId
) {
  try {
    const data =
      await api(
        "getAvatar",
        {
          userId
        }
      );

    if (
      !data.dataUrl
    ) {
      return;
    }

    const element =
      document
        .getElementById(
          elementId
        );

    if (element) {
      element.innerHTML =
        `
          <img
            src="${esc(
              data.dataUrl
            )}"
            alt=""
          >
        `;
    }
  } catch {}
}

function fillForm(
  form,
  values
) {
  Object.entries(
    values || {}
  ).forEach(
    (
      [
        key,
        value
      ]
    ) => {
      const input =
        form.elements
          .namedItem(
            key
          );

      if (!input) {
        return;
      }

      if (
        input.type ===
        "checkbox"
      ) {
        input.checked =
          bool(value);
      } else if (
        key ===
          "options" &&
        Array.isArray(
          value
        )
      ) {
        input.value =
          value.join(
            "\n"
          );
      } else {
        input.value =
          value == null
            ? ""
            : value;
      }
    }
  );

  form.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function fileToBase64(
  file
) {
  return new Promise(
    (
      resolve,
      reject
    ) => {
      const reader =
        new FileReader();

      reader.onload =
        () =>
          resolve(
            String(
              reader.result
            )
              .split(",")[1] ||
            ""
          );

      reader.onerror =
        reject;

      reader.readAsDataURL(
        file
      );
    }
  );
}

async function handleSubmit(
  event
) {
  const form =
    event.target;

  if (
    !(
      form instanceof
      HTMLFormElement
    )
  ) {
    return;
  }

  event.preventDefault();

  const button =
    form.querySelector(
      "button[type='submit']"
    );

  setBusy(
    button,
    true
  );

  try {
    const data =
      formObject(
        form
      );

    if (
      form.id ===
      "messageForm"
    ) {
      await api(
        "sendMessage",
        data
      );

      toast(
        "Message sent.",
        "success"
      );

      await renderMessages();

    } else if (
      form.id ===
      "quizForm"
    ) {
      const answers =
        [
          ...form
            .querySelectorAll(
              "[name^='q_']"
            )
        ]
          .reduce(
            (
              list,
              input
            ) => {
              if (
                input.type ===
                  "radio" &&
                !input.checked
              ) {
                return list;
              }

              list.push({
                questionId:
                  input.name
                    .slice(2),
                answer:
                  input.value
              });

              return list;
            },
            []
          );

      const result =
        await api(
          "submitQuiz",
          {
            quizId:
              form.dataset
                .quizId,
            answers
          }
        );

      toast(
        result.attempt
          .status ===
          "pending"
          ? "Quiz submitted for mentor grading."
          : `Quiz graded: ${Number(
              result.attempt
                .score
            )}%.`,
        "success"
      );

      app.lesson =
        await api(
          "getLesson",
          {
            lessonId:
              app.lesson
                .lesson
                .id
          }
        );

      app.quizId =
        "";

      renderLessonReader();

    } else if (
      form.classList
        .contains(
          "submission-form"
        )
    ) {
      await api(
        "gradeSubmission",
        {
          attemptId:
            form.dataset
              .attemptId,
          score:
            data.score,
          feedback:
            data.feedback
        }
      );

      toast(
        "Submission graded.",
        "success"
      );

      await renderSubmissions();

    } else if (
      form.id ===
      "policyForm"
    ) {
      await api(
        "savePolicy",
        data
      );

      toast(
        "Policy saved.",
        "success"
      );

      await renderPolicies();

    } else if (
      form.id ===
      "resourceForm"
    ) {
      await api(
        "saveResource",
        data
      );

      toast(
        "Resource saved.",
        "success"
      );

      await renderResources();

    } else if (
      form.id ===
      "lessonForm"
    ) {
      await api(
        "saveLesson",
        data
      );

      toast(
        "Lesson saved.",
        "success"
      );

      await renderCurriculum();

    } else if (
      form.id ===
      "pageForm"
    ) {
      await api(
        "saveLessonPage",
        data
      );

      toast(
        "Lesson page saved.",
        "success"
      );

      await renderCurriculum();

    } else if (
      form.id ===
      "quizEditorForm"
    ) {
      await api(
        "saveQuiz",
        data
      );

      toast(
        "Quiz saved.",
        "success"
      );

      await renderCurriculum();

    } else if (
      form.id ===
      "questionForm"
    ) {
      await api(
        "saveQuestion",
        data
      );

      toast(
        "Question saved.",
        "success"
      );

      await renderCurriculum();

    } else if (
      form.id ===
      "onboardingAdminForm"
    ) {
      await api(
        "saveOnboardingStep",
        data
      );

      toast(
        "Onboarding step saved.",
        "success"
      );

      await renderOnboardingManagement();

    } else if (
      form.id ===
      "restrictedUnlockForm"
    ) {
      const result =
        await api(
          "listRestricted",
          {
            password:
              data.password
          }
        );

      app.restrictedPassword =
        data.password;

      app.restrictedData =
        result;

      await renderRestricted();

    } else if (
      form.id ===
      "restrictedForm"
    ) {
      const uploads = [];

      const files =
        [
          ...document
            .getElementById(
              "restrictedFiles"
            )
            .files
        ];

      for (
        const file
        of files
      ) {
        const base64 =
          await fileToBase64(
            file
          );

        const result =
          await api(
            "uploadRestrictedEvidence",
            {
              password:
                app.restrictedPassword,
              name:
                file.name,
              mimeType:
                file.type ||
                "application/octet-stream",
              base64
            }
          );

        uploads.push(
          result.upload.id
        );
      }

      await api(
        "saveRestricted",
        {
          ...data,
          password:
            app.restrictedPassword,
          evidence:
            uploads
        }
      );

      toast(
        "Restricted record saved.",
        "success"
      );

      app.restrictedData =
        await api(
          "listRestricted",
          {
            password:
              app.restrictedPassword
          }
        );

      await renderRestricted();

    } else if (
      form.id ===
      "createAccountForm"
    ) {
      await api(
        "createAccount",
        data
      );

      toast(
        "Account created.",
        "success"
      );

      await renderAccounts();

    } else if (
      form.id ===
      "announcementForm"
    ) {
      await api(
        "saveAnnouncement",
        data
      );

      toast(
        "Announcement saved.",
        "success"
      );

      await refreshBootstrapData();

      await renderAnnouncements();

    } else if (
      form.classList
        .contains(
          "content-form"
        )
    ) {
      await api(
        "saveContent",
        {
          key:
            form.dataset
              .key,
          value:
            data.value
        }
      );

      app.content[
        form.dataset.key
      ] =
        data.value;

      toast(
        "Portal content saved.",
        "success"
      );

    } else if (
      form.id ===
      "maintenanceForm"
    ) {
      await api(
        "setMaintenance",
        data
      );

      toast(
        "Maintenance state saved.",
        "success"
      );

      await renderAdminTools();

    } else if (
      form.id ===
      "profileForm"
    ) {
      const result =
        await api(
          "updateProfile",
          data
        );

      app.user = {
        ...app.user,
        ...result.profile
      };

      updateShell();

      toast(
        "Profile saved.",
        "success"
      );

      await renderProfile();

    } else if (
      form.id ===
      "avatarForm"
    ) {
      const file =
        form.elements
          .avatar
          .files[0];

      const base64 =
        await fileToBase64(
          file
        );

      await api(
        "uploadAvatar",
        {
          name:
            file.name,
          mimeType:
            file.type ||
            "image/png",
          base64
        }
      );

      toast(
        "Profile picture updated.",
        "success"
      );

      await renderProfile();

    } else if (
      form.id ===
      "settingsForm"
    ) {
      const result =
        await api(
          "saveUserSettings",
          data
        );

      applySettings(
        result.settings
      );

      toast(
        "Settings saved.",
        "success"
      );

    } else if (
      form.id ===
        "passwordForm" ||
      form.id ===
        "forcedPasswordForm"
    ) {
      const result =
        await api(
          "changePassword",
          data
        );

      localStorage.setItem(
        "modPortalSessionToken",
        result.token
      );

      app.user =
        result.user;

      updateShell();

      toast(
        "Password changed.",
        "success"
      );

      closeModal();

      if (
        form.id ===
        "passwordForm"
      ) {
        await renderSettings();
      } else {
        await navigate(
          "dashboard",
          true
        );
      }

    } else if (
      form.id ===
      "helpForm"
    ) {
      await api(
        "saveHelp",
        data
      );

      toast(
        "Help entry saved.",
        "success"
      );

      await renderHelp();
    }

  } catch (error) {
    toast(
      error.message ||
      "Action failed.",
      "error"
    );
  } finally {
    if (
      document.contains(
        button
      )
    ) {
      setBusy(
        button,
        false
      );
    }
  }
}

async function handleClick(
  event
) {
  const button =
    event.target.closest(
      "[data-action]"
    );

  if (!button) {
    return;
  }

  const action =
    button.dataset.action;

  try {

    if (
      action ===
      "open-lesson"
    ) {
      await openLesson(
        button.dataset.id
      );

    } else if (
      action ===
      "back-training"
    ) {
      pageTitle.textContent =
        pageTitles.training;

      await renderTraining();

    } else if (
      action ===
      "lesson-page"
    ) {
      app.lessonPageId =
        button.dataset.id;

      app.quizId =
        "";

      renderLessonReader();

    } else if (
      action ===
      "open-quiz"
    ) {
      app.quizId =
        button.dataset.id;

      renderLessonReader();

    } else if (
      action ===
      "close-quiz"
    ) {
      app.quizId =
        "";

      renderLessonReader();

    } else if (
      action ===
      "complete-page"
    ) {
      await api(
        "completePage",
        {
          lessonId:
            app.lesson
              .lesson
              .id,
          pageId:
            button.dataset
              .id
        }
      );

      app.lesson =
        await api(
          "getLesson",
          {
            lessonId:
              app.lesson
                .lesson
                .id
          }
        );

      toast(
        "Page marked complete.",
        "success"
      );

      renderLessonReader();

    } else if (
      action ===
      "save-note"
    ) {
      await api(
        "saveNote",
        {
          lessonId:
            app.lesson
              .lesson
              .id,
          pageId:
            button.dataset
              .pageId ||
            "",
          body:
            document
              .getElementById(
                "lessonNote"
              )
              .value
        }
      );

      app.lesson =
        await api(
          "getLesson",
          {
            lessonId:
              app.lesson
                .lesson
                .id
          }
        );

      toast(
        "Notes saved.",
        "success"
      );

      renderLessonReader();

    } else if (
      action ===
      "mark-message-read"
    ) {
      await api(
        "markMessageRead",
        {
          id:
            button.dataset.id
        }
      );

      await renderMessages();

    } else if (
      action ===
      "mark-notification-read"
    ) {
      await api(
        "markNotificationRead",
        {
          id:
            button.dataset.id
        }
      );

      await renderNotifications();

    } else if (
      action ===
      "mark-all-notifications"
    ) {
      await api(
        "markAllNotificationsRead"
      );

      await renderNotifications();

    } else if (
      action ===
      "ack-policy"
    ) {
      await api(
        "acknowledgePolicy",
        {
          policyId:
            button.dataset.id
        }
      );

      toast(
        "Policy acknowledged.",
        "success"
      );

      await renderPolicies();

    } else if (
      action ===
      "edit-policy"
    ) {
      const item =
        app.cachePolicies.find(
          row =>
            String(
              row.id
            ) ===
            String(
              button.dataset.id
            )
        );

      if (item) {
        fillForm(
          document
            .getElementById(
              "policyForm"
            ),
          item
        );
      }

    } else if (
      action ===
      "delete-policy"
    ) {
      if (
        confirm(
          "Delete this policy?"
        )
      ) {
        await api(
          "deletePolicy",
          {
            id:
              button.dataset.id
          }
        );

        await renderPolicies();
      }

    } else if (
      action ===
      "edit-resource"
    ) {
      const item =
        app.cacheResources.find(
          row =>
            String(
              row.id
            ) ===
            String(
              button.dataset.id
            )
        );

      if (item) {
        fillForm(
          document
            .getElementById(
              "resourceForm"
            ),
          item
        );
      }

    } else if (
      action ===
      "approve-resource"
    ) {
      const item =
        app.cacheResources.find(
          row =>
            String(
              row.id
            ) ===
            String(
              button.dataset.id
            )
        );

      if (item) {
        await api(
          "saveResource",
          {
            id:
              item.id,
            title:
              item.title,
            category:
              item.category,
            description:
              item.description,
            url:
              item.url,
            published:
              true
          }
        );

        toast(
          "Resource approved.",
          "success"
        );

        await renderResources();
      }

    } else if (
      action ===
      "delete-resource"
    ) {
      if (
        confirm(
          "Delete this resource?"
        )
      ) {
        await api(
          "deleteResource",
          {
            id:
              button.dataset.id
          }
        );

        await renderResources();
      }

    } else if (
      action ===
      "complete-onboarding"
    ) {
      await api(
        "completeOnboardingStep",
        {
          stepId:
            button.dataset.id
        }
      );

      toast(
        "Onboarding step completed.",
        "success"
      );

      await renderOnboarding();

    } else if (
      action ===
      "toggle-lesson-unlock"
    ) {
      await api(
        "setTrainingAccess",
        {
          userId:
            button.dataset
              .userId,
          lessonId:
            button.dataset
              .lessonId,
          mentorUnlock:
            button.dataset
              .value
        }
      );

      await renderMentor();

    } else if (
      action ===
      "toggle-final-unlock"
    ) {
      await api(
        "setTrainingAccess",
        {
          userId:
            button.dataset
              .userId,
          lessonId:
            button.dataset
              .lessonId,
          finalQuizUnlocked:
            button.dataset
              .value
        }
      );

      await renderMentor();

    } else if (
      action ===
      "save-mentor"
    ) {
      const select =
        document.querySelector(
          `.mentor-select[data-user-id="${CSS.escape(
            button.dataset.userId
          )}"]`
        );

      await api(
        "assignMentor",
        {
          userId:
            button.dataset
              .userId,
          mentorId:
            select.value
        }
      );

      toast(
        "Mentor assignment saved.",
        "success"
      );

      await renderStaffManagement();

    } else if (
      action ===
      "suspend-user"
    ) {
      if (
        confirm(
          "Suspend this account?"
        )
      ) {
        await api(
          "suspendAccount",
          {
            userId:
              button.dataset
                .userId
          }
        );

        await renderStaffManagement();
      }

    } else if (
      action ===
      "reactivate-user"
    ) {
      await api(
        "reactivateAccount",
        {
          userId:
            button.dataset
              .userId
        }
      );

      await renderStaffManagement();

    } else if (
      action ===
      "edit-curriculum"
    ) {
      editCurriculum(
        button.dataset.type,
        button.dataset.id
      );

    } else if (
      action ===
      "delete-curriculum"
    ) {
      await deleteCurriculum(
        button.dataset.type,
        button.dataset.id
      );

    } else if (
      action ===
      "edit-onboarding-admin"
    ) {
      const item =
        app.cacheOnboarding.find(
          row =>
            String(
              row.id
            ) ===
            String(
              button.dataset.id
            )
        );

      if (item) {
        fillForm(
          document
            .getElementById(
              "onboardingAdminForm"
            ),
          item
        );
      }

    } else if (
      action ===
      "delete-onboarding-admin"
    ) {
      if (
        confirm(
          "Delete this onboarding step?"
        )
      ) {
        await api(
          "deleteOnboardingStep",
          {
            id:
              button.dataset.id
          }
        );

        await renderOnboardingManagement();
      }

    } else if (
      action ===
      "lock-restricted"
    ) {
      app.restrictedPassword =
        "";

      app.restrictedData =
        null;

      await renderRestricted();

    } else if (
      action ===
      "clear-restricted-form"
    ) {
      const form =
        document
          .getElementById(
            "restrictedForm"
          );

      if (form) {
        form.reset();

        form.elements
          .id
          .value =
            "";

        form.elements
          .userId
          .readOnly =
            false;
      }

    } else if (
      action ===
      "edit-restricted"
    ) {
      const data =
        await api(
          "getRestricted",
          {
            password:
              app.restrictedPassword,
            id:
              button.dataset.id
          }
        );

      const form =
        document
          .getElementById(
            "restrictedForm"
          );

      if (form) {
        fillForm(
          form,
          data.record
        );

        form.elements
          .userId
          .readOnly =
            true;

        form.scrollIntoView({
          behavior:
            "smooth",
          block:
            "start"
        });
      }

    } else if (
      action ===
      "view-restricted"
    ) {
      const data =
        await api(
          "getRestricted",
          {
            password:
              app.restrictedPassword,
            id:
              button.dataset.id
          }
        );

      const record =
        data.record;

      showModal(
        record.title,
        `
          <div class="stack">

            <div>
              <strong>
                Immutable User ID
              </strong>

              <p>
                ${esc(
                  record.userId
                )}
              </p>
            </div>

            <div>
              <strong>
                Status
              </strong>

              <p>
                ${esc(
                  record.status ||
                  ""
                )}
              </p>
            </div>

            <div>
              <strong>
                Reasons
              </strong>

              <div class="prose">
                ${nl(
                  record.description ||
                  ""
                )}
              </div>
            </div>

            <div>
              <strong>
                Extra notes
              </strong>

              <div class="prose">
                ${nl(
                  record.extraNotes ||
                  ""
                )}
              </div>
            </div>

            <div>
              <strong>
                Evidence
              </strong>

              ${
                record.evidence.length
                  ? `
                    <div class="button-row">

                      ${record.evidence
                        .map(
                          id => `
                            <button
                              class="btn small"
                              data-modal-action="view-evidence"
                              data-upload-id="${esc(
                                id
                              )}"
                              data-record-id="${esc(
                                record.id
                              )}"
                            >
                              Open Evidence
                            </button>
                          `
                        )
                        .join("")}

                    </div>
                  `
                  : `
                    <p class="muted">
                      No evidence files.
                    </p>
                  `
              }

            </div>

          </div>
        `
      );

    } else if (
      action ===
      "approve-account"
    ) {
      await api(
        "approveAccount",
        {
          userId:
            button.dataset
              .userId,
          clearance:
            1
        }
      );

      toast(
        "Account approved.",
        "success"
      );

      await renderAccounts();

    } else if (
      action ===
      "reject-account"
    ) {
      if (
        confirm(
          "Reject this account request?"
        )
      ) {
        await api(
          "rejectAccount",
          {
            userId:
              button.dataset
                .userId
          }
        );

        toast(
          "Account request rejected.",
          "success"
        );

        await renderAccounts();
      }

    } else if (
      action ===
      "reset-password"
    ) {
      const result =
        await api(
          "resetPassword",
          {
            userId:
              button.dataset
                .userId
          }
        );

      showModal(
        "Temporary password",
        `
          <div class="alert warning">
            Copy this password now. It is only returned for this reset.
          </div>

          <div class="card">
            <strong
              style="font-size:18px"
            >
              ${esc(
                result
                  .temporaryPassword
              )}
            </strong>
          </div>
        `
      );

    } else if (
      action ===
      "save-clearance"
    ) {
      const select =
        document
          .querySelector(
            `.clearance-select[data-user-id="${CSS.escape(
              button.dataset.userId
            )}"]`
          );

      await api(
        "setClearance",
        {
          userId:
            button.dataset
              .userId,
          clearance:
            select.value
        }
      );

      toast(
        "Clearance updated.",
        "success"
      );

      await renderAccounts();

    } else if (
      action ===
      "edit-announcement"
    ) {
      const item =
        app.cacheAnnouncements
          .find(
            row =>
              String(
                row.id
              ) ===
              String(
                button.dataset.id
              )
          );

      if (item) {
        fillForm(
          document
            .getElementById(
              "announcementForm"
            ),
          item
        );
      }

    } else if (
      action ===
      "delete-announcement"
    ) {
      if (
        confirm(
          "Delete this announcement?"
        )
      ) {
        await api(
          "deleteAnnouncement",
          {
            id:
              button.dataset.id
          }
        );

        await refreshBootstrapData();

        await renderAnnouncements();
      }

    } else if (
      action ===
      "cleanup-sessions"
    ) {
      const result =
        await api(
          "cleanupSessions"
        );

      toast(
        `${Number(
          result.cleaned
        )} expired sessions cleaned.`,
        "success"
      );

      await renderAdminTools();

    } else if (
      action ===
      "backup-database"
    ) {
      const result =
        await api(
          "backupDatabase"
        );

      toast(
        `Backup created: ${result.name}`,
        "success"
      );

    } else if (
      action ===
      "logout-all"
    ) {
      await api(
        "logoutAll"
      );

      window.location
        .replace(
          "index.html"
        );

    } else if (
      action ===
      "edit-help"
    ) {
      const item =
        app.cacheHelp
          .find(
            row =>
              String(
                row.id
              ) ===
              String(
                button.dataset.id
              )
          );

      if (item) {
        fillForm(
          document
            .getElementById(
              "helpForm"
            ),
          item
        );
      }

    } else if (
      action ===
      "delete-help"
    ) {
      if (
        confirm(
          "Delete this help entry?"
        )
      ) {
        await api(
          "deleteHelp",
          {
            id:
              button.dataset.id
          }
        );

        await renderHelp();
      }
    }

  } catch (error) {
    toast(
      error.message ||
      "Action failed.",
      "error"
    );
  }
}

function editCurriculum(
  type,
  id
) {
  const map = {
    lesson: [
      app.curriculum
        .lessons,
      "lessonForm"
    ],

    page: [
      app.curriculum
        .pages,
      "pageForm"
    ],

    quiz: [
      app.curriculum
        .quizzes,
      "quizEditorForm"
    ],

    question: [
      app.curriculum
        .questions,
      "questionForm"
    ]
  };

  const [
    items,
    formId
  ] =
    map[type] ||
    [];

  const item =
    items?.find(
      row =>
        String(
          row.id
        ) ===
        String(
          id
        )
    );

  if (item) {
    fillForm(
      document
        .getElementById(
          formId
        ),
      item
    );
  }
}

async function deleteCurriculum(
  type,
  id
) {
  const actionMap = {
    lesson:
      "deleteLesson",

    page:
      "deleteLessonPage",

    quiz:
      "deleteQuiz",

    question:
      "deleteQuestion"
  };

  const action =
    actionMap[
      type
    ];

  if (!action) {
    return;
  }

  if (
    !confirm(
      `Delete this ${type}?`
    )
  ) {
    return;
  }

  await api(
    action,
    {
      id
    }
  );

  toast(
    `${type[0].toUpperCase()}${type.slice(1)} deleted.`,
    "success"
  );

  await renderCurriculum();
}

async function refreshBootstrapData() {
  const bootstrap =
    await api(
      "bootstrap"
    );

  app.user =
    bootstrap.user;

  app.content =
    bootstrap.content ||
    {};

  app.announcements =
    bootstrap.announcements ||
    [];

  app.settings =
    bootstrap.settings ||
    app.settings;

  applySettings(
    app.settings
  );

  updateShell();
}

document
  .getElementById(
    "portalNav"
  )
  .addEventListener(
    "click",
    event => {
      const button =
        event.target.closest(
          "[data-page]"
        );

      if (button) {
        navigate(
          button.dataset.page
        );
      }
    }
  );

document
  .querySelectorAll(
    "[data-page-shortcut]"
  )
  .forEach(
    button =>
      button.addEventListener(
        "click",
        () =>
          navigate(
            button.dataset
              .pageShortcut
          )
      )
  );

document
  .getElementById(
    "logoutButton"
  )
  .addEventListener(
    "click",
    () =>
      window.portalLogout()
  );

document
  .getElementById(
    "sidebarToggle"
  )
  .addEventListener(
    "click",
    async () => {
      const collapsed =
        !document.body
          .classList
          .contains(
            "sidebar-collapsed"
          );

      document.body
        .classList
        .toggle(
          "sidebar-collapsed",
          collapsed
        );

      document
        .getElementById(
          "sidebar"
        )
        .classList
        .toggle(
          "collapsed",
          collapsed
        );

      try {
        const result =
          await api(
            "saveUserSettings",
            {
              ...app.settings,
              sidebarCollapsed:
                collapsed
            }
          );

        app.settings =
          result.settings;
      } catch {}
    }
  );

document
  .getElementById(
    "pageSearch"
  )
  .addEventListener(
    "input",
    event => {
      const query =
        event.target
          .value
          .trim()
          .toLowerCase();

      pageContent
        .querySelectorAll(
          ".card,.list-item,tbody tr"
        )
        .forEach(
          element => {
            if (
              element.closest(
                "form"
              ) &&
              element ===
                element.closest(
                  "form"
                )
            ) {
              return;
            }

            element.style.display =
              !query ||
              element
                .textContent
                .toLowerCase()
                .includes(
                  query
                )
                ? ""
                : "none";
          }
        );
    }
  );

pageContent
  .addEventListener(
    "submit",
    handleSubmit
  );

pageContent
  .addEventListener(
    "click",
    handleClick
  );

document
  .getElementById(
    "modalClose"
  )
  .addEventListener(
    "click",
    closeModal
  );

modalBackdrop
  .addEventListener(
    "click",
    event => {
      if (
        event.target ===
        modalBackdrop
      ) {
        closeModal();
      }
    }
  );

modalBody
  .addEventListener(
    "click",
    async event => {
      const button =
        event.target.closest(
          "[data-modal-action]"
        );

      if (!button) {
        return;
      }

      try {
        if (
          button.dataset
            .modalAction ===
          "view-evidence"
        ) {
          const data =
            await api(
              "getRestrictedEvidence",
              {
                password:
                  app.restrictedPassword,
                uploadId:
                  button.dataset
                    .uploadId,
                recordId:
                  button.dataset
                    .recordId
              }
            );

          const link =
            document
              .createElement(
                "a"
              );

          link.href =
            data.dataUrl;

          link.download =
            data.name ||
            "evidence";

          link.click();
        }
      } catch (error) {
        toast(
          error.message ||
          "Could not open evidence.",
          "error"
        );
      }
    }
  );

window.addEventListener(
  "popstate",
  () =>
    navigate(
      location.hash
        .slice(1) ||
      "dashboard",
      true
    )
);

async function forcePasswordResetFlow() {
  if (
    !app.user
      .forcePasswordReset
  ) {
    return;
  }

  showModal(
    "Password change required",
    `
      <form id="forcedPasswordForm">

        <div class="alert warning">
          You must set a new password before using the portal.
        </div>

        <label class="field">
          Current password

          <input
            name="currentPassword"
            type="password"
            required
          >
        </label>

        <label class="field">
          New password

          <input
            name="newPassword"
            type="password"
            minlength="10"
            required
          >
        </label>

        <button
          class="btn primary"
          type="submit"
        >
          Change Password
        </button>

      </form>
    `
  );

  const form =
    document
      .getElementById(
        "forcedPasswordForm"
      );

  form.addEventListener(
    "submit",
    handleSubmit
  );
}

async function initializePortal() {
  applySettings();

  updateShell();

  if (
    app.user
      .forcePasswordReset
  ) {
    await forcePasswordResetFlow();
    return;
  }

  const requested =
    location.hash
      .slice(1);

  const firstPage =
    Number(
      app.user
        .clearance
    ) === 1 &&
    !app.user
      .onboardingComplete
      ? "onboarding"
      : (
          requested ||
          "dashboard"
        );

  await navigate(
    firstPage,
    true
  );
}

initializePortal();
