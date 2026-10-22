
const emailService = require("../services/email/emailService");
const logDriver = require("../services/email/logDriver");

describe("Email service", () => {
  const originalDriver = process.env.EMAIL_DRIVER;

  afterEach(() => {
    jest.restoreAllMocks();

    if (originalDriver === undefined) {
      delete process.env.EMAIL_DRIVER;
    } else {
      process.env.EMAIL_DRIVER = originalDriver;
    }
  });

  test("uses the log driver when configured", async () => {
    process.env.EMAIL_DRIVER = "log";

    const sendSpy = jest
      .spyOn(logDriver, "send")
      .mockResolvedValue({ success: true });

    await emailService.sendEmail({
      to: "test@example.com",
      subject: "Test email",
      event: "user_registered",
    });

    expect(sendSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "test@example.com",
        subject: "Test email",
        event: "user_registered",
      })
    );
  });

  test("rejects an unsupported driver", async () => {
    process.env.EMAIL_DRIVER = "unknown";

    await expect(
      emailService.sendEmail({
        to: "test@example.com",
        subject: "Test email",
      })
    ).rejects.toThrow("EMAIL_DRIVER non pris en charge : unknown");
  });
});
