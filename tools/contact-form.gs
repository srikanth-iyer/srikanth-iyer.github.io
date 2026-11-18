// Google Apps Script for the website's Contact page.
// It runs in Srikanth's own Google account: the page sends each message here,
// and this script emails it to the address below. Setup steps are in README.md.

const TO = "tosrikanthiyer@gmail.com";        // where messages are delivered

function doPost(e) {
  let data = {};
  try {
    data = JSON.parse(e.postData.contents);    // the page sends the message as JSON text
  } catch (err) {
    data = e.parameter || {};                  // or as an ordinary form, as a fallback
  }
  const name = String(data.name || "").trim().slice(0, 200);
  const email = String(data.email || "").trim().slice(0, 200);
  const message = String(data.message || "").trim().slice(0, 5000);

  if (data.website) return reply(true);        // hidden field filled in: a bot, so quietly ignore it
  if (!name || !message || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return reply(false, "missing fields");

  MailApp.sendEmail({
    to: TO,
    replyTo: email,                            // pressing Reply in Gmail answers the visitor
    subject: "Website message from " + name,
    body: "From: " + name + " <" + email + ">\n\n" + message + "\n\n(Sent from the Contact page of your website.)"
  });
  return reply(true);
}

// Answer the page with {"ok": true} or {"ok": false, "error": "..."}
function reply(ok, error) {
  return ContentService.createTextOutput(JSON.stringify(error ? { ok: ok, error: error } : { ok: ok }))
    .setMimeType(ContentService.MimeType.JSON);
}
