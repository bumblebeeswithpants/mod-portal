const PORTAL_SESSION_KEY = "modPortalSessionToken";

document.documentElement.classList.add("auth-loading");

function getPortalToken() {
  return localStorage.getItem(PORTAL_SESSION_KEY);
}

function clearPortalSession() {
  localStorage.removeItem(PORTAL_SESSION_KEY);
}

function finishPortalLoading() {
  document.documentElement.classList.remove("auth-loading");
}

function redirectToLogin() {
  clearPortalSession();
  window.location.replace("index.html");
}

function isAuthError(error) {
  return [
    "INVALID_SESSION",
    "SESSION_EXPIRED",
    "AUTH_REQUIRED",
    "ACCOUNT_INACTIVE",
    "ACCOUNT_SUSPENDED"
  ].includes(error?.code);
}

async function rawPortalRequest(action, payload = {}) {
  const apiUrl = window.PORTAL_CONFIG?.API_URL;

  if (!apiUrl || apiUrl.includes("PASTE_YOUR")) {
    throw new Error("Backend URL is missing.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      redirect: "follow",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        action,
        ...payload
      }),
      signal: controller.signal
    });

    const text = await response.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch {
      throw new Error("The backend returned an invalid response.");
    }

    if (!data.ok) {
      const error = new Error(data.error || "Request failed.");
      error.code = data.code;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("The portal backend took too long to respond.");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

window.portalApi = async function(action, payload = {}) {
  const token = getPortalToken();

  if (!token) {
    redirectToLogin();
    return null;
  }

  try {
    return await rawPortalRequest(action, {
      token,
      ...payload
    });
  } catch (error) {
    if (isAuthError(error)) {
      redirectToLogin();
      return null;
    }

    throw error;
  }
};

window.portalLogout = async function() {
  const token = getPortalToken();

  try {
    if (token) {
      await rawPortalRequest("logout", {
        token
      });
    }
  } catch {}

  redirectToLogin();
};

function loadPortalScript() {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");

    script.src = `script.js?v=${Date.now()}`;

    script.onload = resolve;

    script.onerror = () => {
      reject(
        new Error("script.js could not be loaded.")
      );
    };

    document.body.appendChild(script);
  });
}

function showPortalError(error) {
  finishPortalLoading();

  const message = String(
    error?.message ||
    "The portal could not be loaded."
  );

  const safeMessage = message.replace(
    /[&<>"']/g,
    char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]
  );

  document.body.innerHTML = `
    <main class="login-body">
      <section class="login-shell">
        <div class="login-card">
          <div class="login-brand">MOD PORTAL</div>
          <h1>Portal could not load</h1>
          <div class="alert error">${safeMessage}</div>
          <div class="button-row">
            <button class="btn primary" id="portalRetry" type="button">
              Try Again
            </button>
            <button class="btn" id="portalBackToLogin" type="button">
              Back to Sign In
            </button>
          </div>
        </div>
      </section>
    </main>
  `;

  document
    .getElementById("portalRetry")
    ?.addEventListener("click", () => {
      location.reload();
    });

  document
    .getElementById("portalBackToLogin")
    ?.addEventListener("click", redirectToLogin);
}

async function initializePortalAuth() {
  const token = getPortalToken();

  if (!token) {
    redirectToLogin();
    return;
  }

  try {
    let bootstrap;

    try {
      bootstrap = await rawPortalRequest(
        "bootstrap",
        {
          token
        }
      );
    } catch (error) {
      if (isAuthError(error)) {
        throw error;
      }

      const session = await rawPortalRequest(
        "session",
        {
          token
        }
      );

      bootstrap = {
        user: session.user,
        expiresAt: session.expiresAt,
        content: {},
        announcements: [],
        settings: {}
      };
    }

    window.PORTAL_BOOTSTRAP = bootstrap;

    await loadPortalScript();

    finishPortalLoading();
  } catch (error) {
    if (isAuthError(error)) {
      redirectToLogin();
      return;
    }

    showPortalError(error);
  }
}

initializePortalAuth();
