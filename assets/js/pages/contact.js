// Contact page only: sends the message box to the Google script.
// ---------- The message box ----------
const form = document.getElementById("write"), status = document.getElementById("status");
form.addEventListener("submit", async (e) => {
  e.preventDefault();                                   // stay on this page
  const data = Object.fromEntries(new FormData(form));  // name, email, message, website
  if (data.website) return;                             // the hidden field was filled: a bot
  if (!form.checkValidity()) { status.textContent = "Please add your name, a valid email and a message."; form.reportValidity(); return; }
  const endpoint = form.dataset.endpoint;               // the form service's address, once chosen
  if (!endpoint) { status.textContent = "This box isn't switched on yet. For now, please email me at one of the addresses here."; return; }
  status.textContent = "Sending…";
  try {
    // Sent as plain text so the browser doesn't need an extra permission check that Google scripts can't answer
    const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ name: data.name, email: data.email, message: data.message }) });
    const reply = await res.json().catch(() => ({}));     // the script answers {ok: true} when the email went
    if (!res.ok || reply.ok !== true) throw new Error(reply.error || res.status);
    form.reset(); status.textContent = "Thank you. Your message is on its way.";
  } catch (err) {
    status.textContent = "That didn't go through. Please try again, or email me directly.";
  }
});
