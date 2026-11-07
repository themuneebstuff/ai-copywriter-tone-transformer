// Same defaults as copywriter.py
const DEFAULT_TEMP = { linkedin: 0.5, instagram: 1.0, email: 0.3 };

let platform = "linkedin";
let tone = "professional";

const form = document.getElementById("form");
const nameEl = document.getElementById("name");
const descEl = document.getElementById("desc");
const tempEl = document.getElementById("temp");
const tempVal = document.getElementById("temp-val");
const submitBtn = document.getElementById("submit");
const output = document.getElementById("output");
const copyBtn = document.getElementById("copy");

// Segmented buttons (platform / tone)
function setupSegment(id, onChange) {
  const group = document.getElementById(id);
  group.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    group.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", "false"));
    btn.setAttribute("aria-pressed", "true");
    onChange(btn.dataset.value);
  });
}

setupSegment("platform", (value) => {
  platform = value;
  tempEl.value = DEFAULT_TEMP[value];   // each platform has its own default creativity
  tempVal.textContent = tempEl.value;
});
setupSegment("tone", (value) => { tone = value; });

tempEl.addEventListener("input", () => { tempVal.textContent = tempEl.value; });

function show(text, cls) {
  output.className = "output " + (cls || "");
  output.textContent = text;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const productName = nameEl.value.trim();
  const description = descEl.value.trim();
  if (!productName || !description) return;

  submitBtn.disabled = true;
  submitBtn.textContent = "Writing...";
  copyBtn.hidden = true;
  show("Writing your copy...", "placeholder");

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productName,
        description,
        platform,
        tone,
        temperature: Number(tempEl.value),
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");

    show(data.copy);
    copyBtn.hidden = false;
  } catch (err) {
    show("Error: " + err.message + " Please try again.", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Generate copy";
  }
});

copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(output.textContent);
    copyBtn.textContent = "Copied";
    setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
  } catch {
    copyBtn.textContent = "Press Ctrl+C";
  }
});