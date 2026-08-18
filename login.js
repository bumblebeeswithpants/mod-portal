const PORTAL_SESSION_KEY = "modPortalSessionToken";

async function loginApi(action, payload = {}) {
  const apiUrl =
    window.PORTAL_CONFIG?.API_URL;

  if (!apiUrl) {
    throw new Error(
      "Backend URL is missing."
    );
  }

  const response = await fetch(
    apiUrl,
    {
      method: "POST",
      redirect: "follow",
      headers: {
        "Content-Type":
          "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        action,
        ...payload
      })
    }
  );

  const text =
    await response.text();

  let data;

  try {
    data = JSON.parse(text);
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

function getLoginErrorElement() {
  let element =
    document.getElementById(
      "loginError"
    );

  if (element) {
    return element;
  }

  element =
    document.createElement(
      "div"
    );

  element.id =
    "loginError";

  element.style.display =
    "none";

  element.style.padding =
    "10px 12px";

  element.style.borderRadius =
    "8px";

  element.style.background =
    "var(--danger-soft, #f5e6e7)";

  element.style.color =
    "var(--danger, #9b3d43)";

  element.style.fontSize =
    "11px";

  const form =
    document.querySelector(
      ".login-form"
    );

  form?.prepend(element);

  return element;
}

function showLoginError(message) {
  const element =
    getLoginErrorElement();

  element.textContent =
    message;

  element.style.display =
    "block";
}

function clearLoginError() {
  const element =
    getLoginErrorElement();

  element.textContent = "";
  element.style.display =
    "none";
}

function saveSession(data) {
  localStorage.setItem(
    PORTAL_SESSION_KEY,
    data.token
  );
}

function clearSession() {
  localStorage.removeItem(
    PORTAL_SESSION_KEY
  );
}

async function checkExistingSession() {
  const token =
    localStorage.getItem(
      PORTAL_SESSION_KEY
    );

  if (!token) {
    return;
  }

  try {
    await loginApi(
      "session",
      { token }
    );

    window.location.replace(
      "portal.html"
    );

  } catch {
    clearSession();
  }
}

async function handleLogin(event) {
  event.preventDefault();

  clearLoginError();

  const username =
    document.getElementById(
      "username"
    )?.value.trim();

  const password =
    document.getElementById(
      "password"
    )?.value;

  const button =
    document.querySelector(
      ".login-submit"
    );

  if (!username || !password) {
    showLoginError(
      "Enter your username and password."
    );

    return;
  }

  const originalText =
    button?.textContent ||
    "Sign In";

  if (button) {
    button.disabled = true;
    button.textContent =
      "Signing In...";
  }

  try {
    const data =
      await loginApi(
        "login",
        {
          username,
          password
        }
      );

    saveSession(data);

    window.location.replace(
      "portal.html"
    );

  } catch (error) {
    showLoginError(
      error.message ||
      "Unable to sign in."
    );

    if (button) {
      button.disabled = false;
      button.textContent =
        originalText;
    }
  }
}

document
  .querySelector(
    ".login-form"
  )
  ?.addEventListener(
    "submit",
    handleLogin
  );

checkExistingSession();
