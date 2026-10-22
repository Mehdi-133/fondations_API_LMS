
const logDriver = require("./logDriver");
const { renderTemplate } = require("./templateService");

const sendEmail = async ({
  to,
  subject,
  text,
  html,
  template,
  data = {},
  event = "unspecified",
}) => {
  if (!to || !subject) {
    throw new Error("Le destinataire et le sujet sont obligatoires.");
  }

  if (template) {
    html = renderTemplate(template, data);
  }

  const driver = process.env.EMAIL_DRIVER || "log";

  const email = {
    to,
    subject,
    text,
    html,
    event,
  };

  if (driver === "log") {
    return logDriver.send(email);
  }

  throw new Error(`EMAIL_DRIVER non pris en charge : ${driver}`);
};

module.exports = { sendEmail };
