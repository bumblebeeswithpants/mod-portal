const PORTAL_SESSION_KEY = "modPortalSessionToken";

async function publicApi(action, payload = {}) {
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

function setAlert(element, message, type = "error") {
  element.textContent = message;
  element.className = `alert ${type}`;
  element.hidden = !message;
}

async function checkExistingSession() {
  const token = localStorage.getItem(PORTAL_SESSION_KEY);
  if (!token) return;

  try {
    await publicApi("session", { token });
    window.location.replace("portal.html");
  } catch {
    localStorage.removeItem(PORTAL_SESSION_KEY);
  }
}

document.getElementById("loginForm").addEventListener("submit", async event => {
  event.preventDefault();

  const errorBox = document.getElementById("loginError");
  const button = event.currentTarget.querySelector("button[type='submit']");
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  setAlert(errorBox, "");
  button.disabled = true;
  button.textContent = "Signing In...";

  try {
    const data = await publicApi("login", { username, password });
    localStorage.setItem(PORTAL_SESSION_KEY, data.token);
    window.location.replace("portal.html");
  } catch (error) {
    setAlert(errorBox, error.message || "Unable to sign in.");
    button.disabled = false;
    button.textContent = "Sign In";
  }
});

document.getElementById("showRequestAccess").addEventListener("click", () => {
  document.querySelector(".login-card").hidden = true;
  document.getElementById("requestAccessCard").hidden = false;
});

document.getElementById("cancelRequestAccess").addEventListener("click", () => {
  document.getElementById("requestAccessCard").hidden = true;
  document.querySelector(".login-card").hidden = false;
});

document.getElementById("requestAccessForm").addEventListener("submit", async event => {
  event.preventDefault();

  const box = document.getElementById("requestAccessMessage");
  const button = event.currentTarget.querySelector("button[type='submit']");
  const username = document.getElementById("requestUsername").value.trim();
  const displayName = document.getElementById("requestDisplayName").value.trim();
  const password = document.getElementById("requestPassword").value;

  setAlert(box, "");
  button.disabled = true;
  button.textContent = "Submitting...";

  try {
    await publicApi("requestAccess", { username, displayName, password });
    event.currentTarget.reset();
    setAlert(box, "Request submitted. A supervisor or owner must approve the account before you can sign in.", "success");
  } catch (error) {
    setAlert(box, error.message || "Unable to submit request.");
  } finally {
    button.disabled = false;
    button.textContent = "Submit Request";
  }
});

checkExistingSession();
