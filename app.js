const $ = (id) => document.getElementById(id);

let selectedStyle = document.querySelector(".style-card.active")?.dataset.style || "Bleu nuit profond, ivoire et or";
let generatedImage = null;

function updatePreview() {
  const n1 = $("name1").value.trim() || "Aïcha";
  const n2 = $("name2").value.trim() || "Moussa";
  $("pOccasion").textContent = ($("occasion").value || "Mariage").toUpperCase();
  $("pNames").innerHTML = `${escapeHtml(n1)}<br><span>&amp;</span> ${escapeHtml(n2)}`;
  $("pDate").textContent = $("date").value.trim() || "26 juillet 2026";
  $("pTime").textContent = $("time").value.trim() || "15H00";
  $("pLocation").textContent = $("location").value.trim() || "Douala, Cameroun";
  $("pMessage").textContent = $("message").value.trim() || "Votre présence sera un honneur et une grande joie pour nous.";
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));
}

document.querySelectorAll("input, textarea, select").forEach((el) => {
  el.addEventListener("input", updatePreview);
  el.addEventListener("change", updatePreview);
});

document.querySelectorAll(".style-card").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".style-card").forEach((b) => b.classList.remove("active"));
    button.classList.add("active");
    selectedStyle = button.dataset.style;
  });
});

$("generate").addEventListener("click", async () => {
  const button = $("generate");
  const loading = $("loading");
  const error = $("error");
  error.hidden = true;
  button.disabled = true;
  loading.hidden = false;

  const payload = {
    occasion: $("occasion").value,
    name1: $("name1").value,
    name2: $("name2").value,
    date: $("date").value,
    time: $("time").value,
    location: $("location").value,
    message: $("message").value,
    style: selectedStyle,
    extra: $("extra").value,
  };

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const raw = await response.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error(`Le service a répondu HTTP ${response.status}. Vérifie le déploiement Vercel.`);
    }

    if (!response.ok) throw new Error(data.error || "Impossible de générer la carte.");
    if (!data.image) throw new Error("Aucune image n'a été renvoyée.");

    generatedImage = data.image;
    $("result").src = generatedImage;
    $("resultSection").hidden = false;
    $("previewHint").textContent = "Carte générée";
    $("status").innerHTML = "<span></span> Création terminée";
    $("resultSection").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (err) {
    error.textContent = err.message || "Une erreur est survenue.";
    error.hidden = false;
  } finally {
    loading.hidden = true;
    button.disabled = false;
  }
});

$("download").addEventListener("click", () => {
  if (!generatedImage) return;
  const link = document.createElement("a");
  link.href = generatedImage;
  link.download = "faya-carte.png";
  document.body.appendChild(link);
  link.click();
  link.remove();
});

updatePreview();
