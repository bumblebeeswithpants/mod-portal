const PORTAL_SESSION_KEY = "modPortalSessionToken";

document.documentElement.classList.add("auth-loading");

function getPortalToken() {
  return localStorage.getItem(PORTAL_SESSION_KEY);
}

function clearPortalSession() {
  localStorage.removeItem(PORTAL_SESSION_KEY);
}

function redirectToLogin() {
  clearPortalSession();
  window.location.replace("index.html");
}

async function rawPortalRequest(action, payload = {}) {
  const apiUrl = window.PORTAL_CONFIG?.API_URL;

  if (!apiUrl || apiUrl.includes("PASTE_YOUR")) {
    throw new Error("Backend URL is missing.");
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    redirect: "follow",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify({ action, ...payload })
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
}

window.portalApi = async function(action, payload = {}) {
  const token = getPortalToken();

  if (!token) {
    redirectToLogin();
    return null;
  }

  try {
    return await rawPortalRequest(action, { token, ...payload });
  } catch (error) {
    if (["INVALID_SESSION", "SESSION_EXPIRED", "AUTH_REQUIRED", "ACCOUNT_INACTIVE", "ACCOUNT_SUSPENDED"].includes(error.code)) {
      redirectToLogin();
      return null;
    }
    throw error;
  }
};

window.portalLogout = async function() {
  const token = getPortalToken();

  try {
    if (token) await rawPortalRequest("logout", { token });
  } catch {}

  redirectToLogin();
};

async function initializePortalAuth() {
  const token = getPortalToken();

  if (!token) {
    redirectToLogin();
    return;
  }

  try {
    const bootstrap = await rawPortalRequest("bootstrap", { token });
    window.PORTAL_BOOTSTRAP = bootstrap;

    const script = document.createElement("script");
    script.src = "script.js";
    script.onload = () => document.documentElement.classList.remove("auth-loading");
    script.onerror = () => redirectToLogin();
    document.body.appendChild(script);
  } catch {
    redirectToLogin();
  }
}

initializePortalAuth();
