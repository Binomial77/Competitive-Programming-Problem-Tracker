const BASE_URL = "http://localhost:8080"

function createToastContainer() {
  let el = document.getElementById("toast-container")
  if (!el) {
    el = document.createElement("div")
    el.id = "toast-container"
    el.className = "toast-container"
    document.body.appendChild(el)
  }
  return el
}

function showToast(title, message, type = "info", duration = 3500) {
  const container = createToastContainer()

  const icons = { success: "✓", error: "✕", info: "◆" }

  const toast = document.createElement("div")
  toast.className = `toast ${type}`
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${message}</div>
    </div>
    <button class="toast-close" aria-label="Close">×</button>
  `

  const dismiss = () => {
    toast.classList.add("removing")
    toast.addEventListener("animationend", () => toast.remove(), { once: true })
  }

  toast.querySelector(".toast-close").addEventListener("click", dismiss)

  container.appendChild(toast)
  if (duration > 0) setTimeout(dismiss, duration)
  return toast
}

function showMessage(msg, color = "green") {
  if (color === "green") showToast("Done", msg, "success")
  else showToast("Error", msg, "error")
}

function showError(msg) {
  showToast("Error", msg, "error")
}

function showSuccess(msg) {
  showToast("Success", msg, "success")
}

/* ── Button loading state ── */
function setLoading(btn, loading) {
  if (!btn) return
  if (loading) {
    btn._originalHTML = btn.innerHTML
    btn.innerHTML = `<span class="spinner"></span>`
    btn.classList.add("loading")
  } else {
    btn.innerHTML = btn._originalHTML || btn.innerHTML
    btn.classList.remove("loading")
  }
}

function logout() {
  localStorage.removeItem("token")
  window.location.href = "login.html"
}

function handleUnauthorized(res) {
  if (res.status === 401) {
    localStorage.removeItem("token")
    showToast("Session expired", "Please log in again.", "error", 2000)
    setTimeout(() => (window.location.href = "login.html"), 2000)
    return true
  }
  return false
}

async function signup() {
  const username = document.getElementById("email").value.trim()
  const password = document.getElementById("password").value
  const btn = document.querySelector(".btn-primary")

  if (!username || !password) {
    showToast("Missing fields", "Please fill in all fields.", "error")
    return
  }

  setLoading(btn, true)

  try {
    const res = await fetch(`${BASE_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })

    if (!res.ok) {
      showToast("Signup failed", await res.text(), "error")
      return
    }

    const data = await res.json()
    localStorage.setItem("token", data.token)
    showToast("Welcome", "Account created. Redirecting…", "success")
    setTimeout(() => (window.location.href = "dashboard.html"), 1000)
  } catch {
    showToast("Connection error", "Could not reach the server.", "error")
  } finally {
    setLoading(btn, false)
  }
}

async function login() {
  const username = document.getElementById("email").value.trim()
  const password = document.getElementById("password").value
  const btn = document.querySelector(".btn-primary")

  if (!username || !password) {
    showToast("Missing fields", "Please fill in all fields.", "error")
    return
  }

  setLoading(btn, true)

  try {
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })

    if (!res.ok) {
      showToast("Login failed", await res.text(), "error")
      return
    }

    const data = await res.json()
    localStorage.setItem("token", data.token)
    showToast("Welcome back", "Redirecting…", "success")
    setTimeout(() => (window.location.href = "dashboard.html"), 800)
  } catch {
    showToast("Connection error", "Could not reach the server.", "error")
  } finally {
    setLoading(btn, false)
  }
}

async function addProblem() {
  const token = localStorage.getItem("token")
  const problem_url       = document.getElementById("url").value.trim()
  const problem_name      = document.getElementById("name").value.trim()
  const approach          = document.getElementById("approach").value.trim()
  const difficultyrating  = parseInt(document.getElementById("difficulty").value, 10)
  const btn               = document.getElementById("addBtn")

  if (!problem_url || !problem_name || !approach) {
    showToast("Incomplete", "Fill in URL, name, and approach.", "error")
    return
  }

  if (isNaN(difficultyrating) || difficultyrating < 0) {
    showToast("Incomplete", "Enter a valid difficulty rating.", "error")
    return
  }

  setLoading(btn, true)

  const res = await fetch(`${BASE_URL}/post-problem`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ problem_url, problem_name, approach, difficultyrating }),
  })

  setLoading(btn, false)

  if (handleUnauthorized(res)) return

  if (!res.ok) {
    showToast("Add failed", await res.text(), "error")
    return
  }

  showToast("Added", `"${problem_name}" saved to your log.`, "success")

  document.getElementById("url").value = ""
  document.getElementById("name").value = ""
  document.getElementById("approach").value = ""
  document.getElementById("difficulty").value = ""

  setTimeout(() => loadProblems(), 1200)
}

function skeletonHTML() {
  return `
    <div class="skeleton skeleton-card"></div>
    <div class="skeleton skeleton-card"></div>
    <div class="skeleton skeleton-card"></div>
  `
}

async function loadProblems() {
  const token = localStorage.getItem("token")
  const container = document.getElementById("problems")

  container.style.transition = "opacity 0.2s"
  container.style.opacity = "0"

  await new Promise(r => setTimeout(r, 200))
  container.innerHTML = skeletonHTML()
  container.style.opacity = "1"

  const res = await fetch(`${BASE_URL}/get-all-problems`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (handleUnauthorized(res)) return

  if (!res.ok) {
    container.innerHTML = ""
    showToast("Load failed", await res.text(), "error")
    return
  }

  const problems = await res.json()

  const metaEl = document.getElementById("log-meta")
  if (metaEl) metaEl.textContent = problems.length === 0 ? "" : `${problems.length} problem${problems.length === 1 ? "" : "s"} logged`

  if (problems.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">◻</div>
        No problems logged yet. Add your first one above.
      </div>`
    return
  }

  container.style.opacity = "0"
  container.innerHTML = problems
    .map(p => problemCardHTML(p))
    .join("")
  container.style.transition = "opacity 0.25s"
  requestAnimationFrame(() => { container.style.opacity = "1" })
}

function cfRating(rating) {
  // Returns { label, className } following Codeforces rank colours
  if (rating < 1200) return { label: String(rating), className: "cf-grey" }
  if (rating < 1400) return { label: String(rating), className: "cf-green" }
  if (rating < 1600) return { label: String(rating), className: "cf-cyan" }
  if (rating < 1900) return { label: String(rating), className: "cf-blue" }
  if (rating < 2100) return { label: String(rating), className: "cf-magenta" }
  if (rating < 2300) return { label: String(rating), className: "cf-orange" }
  if (rating < 2400) return { label: String(rating), className: "cf-orange cf-bold" }
  if (rating < 2600) return { label: String(rating), className: "cf-red" }
  if (rating < 3000) return { label: String(rating), className: "cf-red cf-bold" }
  // Legendary Grandmaster: first char black, rest dark red
  const s = String(rating)
  return { label: `<span class="cf-lgm-first">${s[0]}</span>${s.slice(1)}`, className: "cf-lgm", raw: true }
}

function problemCardHTML(p) {
  const safeName     = escapeHTML(p.problem_name)
  const safeApproach = escapeHTML(p.approach)
  const safeUrl      = escapeHTML(p.problem_url)

  const rating = typeof p.difficultyrating === "number" ? p.difficultyrating : null
  let diffBadge = ""
  if (rating !== null) {
    const cf = cfRating(rating)
    const inner = cf.raw ? cf.label : escapeHTML(cf.label)
    diffBadge = `<span class="cf-badge ${cf.className}" title="Difficulty ${rating}">${inner}</span>`
  }

  return `
  <div class="problem-card" data-url="${safeUrl}">
    <label class="problem-check-wrap" aria-label="Select ${safeName}">
      <input type="checkbox" class="problem-checkbox" value="${safeUrl}" onchange="updateBulkBar()">
    </label>
    <div class="problem-body">
      <div class="problem-name-row">
        <div class="problem-name">${safeName}</div>
        ${diffBadge}
      </div>
      <div class="problem-approach">${safeApproach}</div>
      <span class="problem-tag">Logged</span>
    </div>
    <div class="problem-actions">
      <button class="btn btn-secondary btn-sm" onclick="window.open('${safeUrl}', '_blank')">
        Open ↗
      </button>
    </div>
  </div>`
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

async function searchByName() {
  const token = localStorage.getItem("token")
  const name = document.getElementById("searchName").value.trim()
  const btn  = document.getElementById("searchNameBtn")

  if (!name) { showToast("Enter a name", "Type a problem name to search.", "error"); return }

  setLoading(btn, true)

  const res = await fetch(
    `${BASE_URL}/get-problem-by-name?name=${encodeURIComponent(name)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )

  setLoading(btn, false)

  if (handleUnauthorized(res)) return

  if (!res.ok) {
    showToast("Not found", await res.text(), "error")
    return
  }

  const p = await res.json()
  document.getElementById("problems").innerHTML = problemCardHTML(p)
  showToast("Found", `Showing result for "${escapeHTML(name)}"`, "info")
}

async function searchByURL() {
  const token = localStorage.getItem("token")
  const url   = document.getElementById("searchUrl").value.trim()
  const btn   = document.getElementById("searchUrlBtn")

  if (!url) { showToast("Enter a URL", "Paste a problem URL to search.", "error"); return }

  setLoading(btn, true)

  const res = await fetch(
    `${BASE_URL}/get-problem-by-url?url=${encodeURIComponent(url)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )

  setLoading(btn, false)

  if (handleUnauthorized(res)) return

  if (!res.ok) {
    showToast("Not found", await res.text(), "error")
    return
  }

  const p = await res.json()
  document.getElementById("problems").innerHTML = problemCardHTML(p)
  showToast("Found", "Showing matched problem.", "info")
}

function updateBulkBar() {
  const checked = document.querySelectorAll(".problem-checkbox:checked")
  const bar = document.getElementById("bulk-bar")
  const countEl = document.getElementById("bulk-count")
  if (checked.length > 0) {
    bar.style.display = "flex"
    countEl.textContent = `${checked.length} selected`
  } else {
    bar.style.display = "none"
  }
}

async function deleteSelected() {
  const checked = [...document.querySelectorAll(".problem-checkbox:checked")]
  if (checked.length === 0) return

  if (!confirm(`Remove ${checked.length} problem${checked.length === 1 ? "" : "s"} from your log?`)) return

  const token = localStorage.getItem("token")
  const btn = document.getElementById("bulkDeleteBtn")
  setLoading(btn, true)

  let failed = 0
  for (const cb of checked) {
    const url = cb.value
    try {
      const res = await fetch(`${BASE_URL}/delete-problem`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ urls: [url] }),
      })
      if (handleUnauthorized(res)) { setLoading(btn, false); return }
      if (!res.ok) failed++
    } catch {
      failed++
    }
  }

  setLoading(btn, false)
  document.getElementById("bulk-bar").style.display = "none"

  if (failed > 0) {
    showToast("Partial failure", `${failed} problem${failed === 1 ? "" : "s"} could not be deleted.`, "error")
    setTimeout(() => loadProblems(), 1200)
  } else {
    showToast("Removed", `${checked.length} problem${checked.length === 1 ? "" : "s"} deleted.`, "success")
    const cards = [...document.querySelectorAll(".problem-card")]
    const checkedUrls = new Set(checked.map(cb => cb.value))
    cards.forEach(card => {
      if (checkedUrls.has(card.dataset.url)) {
        card.style.transition = "opacity 0.3s, transform 0.3s"
        card.style.opacity = "0"
        card.style.transform = "translateX(12px)"
      }
    })
    setTimeout(() => loadProblems(), 1200)
  }
}