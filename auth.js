const PORTAL_SESSION_KEY =
  "modPortalSessionToken";

document.body.style.visibility =
  "hidden";

function getPortalToken() {
  return localStorage.getItem(
    PORTAL_SESSION_KEY
  );
}

function clearPortalSession() {
  localStorage.removeItem(
    PORTAL_SESSION_KEY
  );
}

async function portalRequest(
  action,
  payload = {}
) {
  const apiUrl =
    window.PORTAL_CONFIG?.API_URL;

  if (
    !apiUrl ||
    apiUrl.includes(
      "PASTE_YOUR"
    )
  ) {
    throw new Error(
      "Backend URL is missing."
    );
  }

  const response =
    await fetch(
      apiUrl,
      {
        method: "POST",
        redirect: "follow",
        headers: {
          "Content-Type":
            "text/plain;charset=utf-8"
        },
        body:
          JSON.stringify({
            action,
            ...payload
          })
      }
    );

  const text =
    await response.text();

  let data;

  try {
    data =
      JSON.parse(
        text
      );
  } catch {
    throw new Error(
      "The backend returned an invalid response."
    );
  }

  if (!data.ok) {
    const error =
      new Error(
        data.error ||
        "Request failed."
      );

    error.code =
      data.code;

    throw error;
  }

  return data;
}

function getAuthInitials(
  name
) {
  return String(
    name || ""
  )
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(
      part =>
        part.charAt(0)
    )
    .join("")
    .toUpperCase() ||
    "MP";
}

function saveAuthenticatedUser(
  user
) {
  let state = {};

  try {
    state =
      JSON.parse(
        localStorage.getItem(
          "modPortalState"
        ) || "{}"
      );
  } catch {
    state = {};
  }

  state.currentUser = {
    id:
      user.id,

    username:
      user.username,

    displayName:
      user.displayName,

    initials:
      getAuthInitials(
        user.displayName
      ),

    role:
      user.role,

    clearance:
      Number(
        user.clearance
      ),

    status:
      user.status,

    mentor:
      user.mentorId ||
      "",

    mentorId:
      user.mentorId ||
      "",

    forcePasswordReset:
      Boolean(
        user.forcePasswordReset
      ),

    description:
      user.description ||
      "",

    lastLogin:
      user.lastLogin ||
      "",

    grade:
      null
  };

  localStorage.setItem(
    "modPortalState",
    JSON.stringify(
      state
    )
  );
}

function redirectToLogin() {
  clearPortalSession();

  window.location.replace(
    "index.html"
  );
}

async function logoutPortal() {
  const token =
    getPortalToken();

  try {
    if (token) {
      await portalRequest(
        "logout",
        {
          token
        }
      );
    }
  } catch {}

  redirectToLogin();
}

function loadPortalScript() {
  return new Promise(
    (
      resolve,
      reject
    ) => {
      const script =
        document.createElement(
          "script"
        );

      script.src =
        "script.js";

      script.onload =
        resolve;

      script.onerror =
        reject;

      document.body.appendChild(
        script
      );
    }
  );
}

window.portalApi =
  async function (
    action,
    payload = {}
  ) {
    const token =
      getPortalToken();

    if (!token) {
      redirectToLogin();
      return;
    }

    try {
      return await portalRequest(
        action,
        {
          token,
          ...payload
        }
      );

    } catch (error) {
      if (
        error.code ===
          "INVALID_SESSION" ||
        error.code ===
          "SESSION_EXPIRED" ||
        error.code ===
          "AUTH_REQUIRED" ||
        error.code ===
          "ACCOUNT_INACTIVE" ||
        error.code ===
          "ACCOUNT_SUSPENDED"
      ) {
        redirectToLogin();
        return;
      }

      throw error;
    }
  };

window.portalLogout =
  logoutPortal;

document.addEventListener(
  "click",
  event => {
    const button =
      event.target.closest(
        "#signOutButton"
      );

    if (!button) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    logoutPortal();
  },
  true
);

async function initializePortalAuth() {
  const token =
    getPortalToken();

  if (!token) {
    redirectToLogin();
    return;
  }

  try {
    const data =
      await portalRequest(
        "session",
        {
          token
        }
      );

    window.PORTAL_AUTH =
      data;

    saveAuthenticatedUser(
      data.user
    );

    await loadPortalScript();

    document.body.style.visibility =
      "visible";

  } catch {
    redirectToLogin();
  }
}

initializePortalAuth();
