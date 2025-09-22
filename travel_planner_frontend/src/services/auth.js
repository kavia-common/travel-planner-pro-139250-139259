//
// Local storage-based authentication and per-user data storage
//

const STORAGE_KEYS = {
  USERS: "otp_users", // array of { id, email, username, passwordHash, createdAt }
  SESSION: "otp_session", // { userId, email, username, createdAt }
  USER_DATA_PREFIX: "otp_user_data_", // per-user itinerary and settings
};

// Simple hash for demo purposes (NOT secure). Avoid storing plaintext passwords.
function simpleHash(str) {
  let hash = 0;
  if (!str || !str.length) return String(hash);
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return String(hash);
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// PUBLIC_INTERFACE
export function getSession() {
  /** Get the current logged-in session (or null). */
  return readJSON(STORAGE_KEYS.SESSION, null);
}

// PUBLIC_INTERFACE
export function logout() {
  /** Clear session. */
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}

// PUBLIC_INTERFACE
export function signup({ email, username, password }) {
  /** Register a user and create a session. Stores hashed password locally.
   * Throws on validation failure or duplicate users.
   * Returns: { userId, email, username }
   */
  const users = readJSON(STORAGE_KEYS.USERS, []);
  const emailNorm = String(email || "").trim().toLowerCase();
  const usernameNorm = String(username || "").trim();

  if (!emailNorm || !usernameNorm || !password) throw new Error("All fields are required.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) throw new Error("Invalid email format.");
  // Password strength: at least 8 chars, one number, one letter
  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    throw new Error("Password must be at least 8 characters and include letters and numbers.");
  }

  if (users.find((u) => u.email === emailNorm)) throw new Error("Email already registered.");
  if (users.find((u) => u.username.toLowerCase() === usernameNorm.toLowerCase()))
    throw new Error("Username already taken.");

  const id = `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const user = {
    id,
    email: emailNorm,
    username: usernameNorm,
    passwordHash: simpleHash(password),
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  writeJSON(STORAGE_KEYS.USERS, users);

  const session = { userId: id, email: user.email, username: user.username, createdAt: new Date().toISOString() };
  writeJSON(STORAGE_KEYS.SESSION, session);

  // Initialize per-user data container
  const userDataKey = STORAGE_KEYS.USER_DATA_PREFIX + id;
  writeJSON(userDataKey, { itineraries: [], lastItinerary: null });

  return session;
}

// PUBLIC_INTERFACE
export function login({ identifier, password }) {
  /** Login by email or username with password.
   * Returns: { userId, email, username }
   */
  const users = readJSON(STORAGE_KEYS.USERS, []);
  const ident = String(identifier || "").trim().toLowerCase();
  const pwdHash = simpleHash(password || "");
  const user = users.find(
    (u) => u.email === ident || u.username.toLowerCase() === ident
  );
  if (!user || user.passwordHash !== pwdHash) throw new Error("Invalid credentials.");

  const session = { userId: user.id, email: user.email, username: user.username, createdAt: new Date().toISOString() };
  writeJSON(STORAGE_KEYS.SESSION, session);

  // Ensure user data exists
  const userDataKey = STORAGE_KEYS.USER_DATA_PREFIX + user.id;
  const existing = readJSON(userDataKey, null);
  if (!existing) {
    writeJSON(userDataKey, { itineraries: [], lastItinerary: null });
  }
  return session;
}

// PUBLIC_INTERFACE
export function getUserData(userId) {
  /** Get per-user data container. */
  if (!userId) return null;
  return readJSON(STORAGE_KEYS.USER_DATA_PREFIX + userId, { itineraries: [], lastItinerary: null });
}

// PUBLIC_INTERFACE
export function saveUserData(userId, data) {
  /** Save per-user data container (itineraries etc.). */
  if (!userId) throw new Error("Missing userId");
  writeJSON(STORAGE_KEYS.USER_DATA_PREFIX + userId, data || {});
}

// PUBLIC_INTERFACE
export function saveUserItinerary(userId, itineraryItems) {
  /** Save the current itinerary items for the user.
   * Stores as a single "lastItinerary" and also appends a snapshot to "itineraries".
   */
  if (!userId) return;
  const data = getUserData(userId) || { itineraries: [], lastItinerary: null };
  const snapshot = {
    id: `iti_${Date.now()}`,
    createdAt: new Date().toISOString(),
    items: Array.isArray(itineraryItems) ? itineraryItems : [],
  };
  data.lastItinerary = snapshot;
  data.itineraries = Array.isArray(data.itineraries) ? [...data.itineraries, snapshot] : [snapshot];
  saveUserData(userId, data);
}

// PUBLIC_INTERFACE
export function loadLastUserItinerary(userId) {
  /** Return the user's last saved itinerary snapshot or null. */
  const data = getUserData(userId);
  return data?.lastItinerary?.items || null;
}
