
const send = async ({ to, subject, event }) => {
  const emailLog = {
    driver: "log",
    event: event || "unspecified",
    recipient: to,
    subject,
    timestamp: new Date().toISOString(),
    success: true,
  };

  console.log("[EMAIL]", JSON.stringify(emailLog));

  return {
    success: true,
    driver: "log",
    event: emailLog.event,
    timestamp: emailLog.timestamp,
  };
};

module.exports = { send };
