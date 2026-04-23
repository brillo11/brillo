"use server";

interface SendSmsInput {
  body: string;
  recipientNo?: string;
}

interface SendSmsResult {
  success: boolean;
  requestId?: string;
  error?: string;
}

export async function sendSms(input: SendSmsInput): Promise<SendSmsResult> {
  const url = process.env.NHN_SMS_URL;
  const appKey = process.env.NHN_SMS_APP_KEY;
  const secretKey = process.env.NHN_SMS_SECRET_KEY;
  const sendNo = process.env.NHN_SMS_SEND_NO;
  const recipient = input.recipientNo || process.env.NHN_SMS_ADMIN_RECIPIENT;

  if (!url || !appKey || !secretKey || !sendNo || !recipient) {
    return {
      success: false,
      error: "NHN SMS env vars missing",
    };
  }

  try {
    const response = await fetch(
      `${url}/sms/v3.0/appKeys/${appKey}/sender/sms`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          "X-Secret-Key": secretKey,
        },
        body: JSON.stringify({
          body: input.body,
          sendNo,
          recipientList: [{ recipientNo: recipient }],
        }),
      },
    );

    const json: any = await response.json().catch(() => ({}));

    if (!response.ok || !json?.header?.isSuccessful) {
      return {
        success: false,
        error:
          json?.header?.resultMessage ||
          `SMS send failed (HTTP ${response.status})`,
      };
    }

    return {
      success: true,
      requestId: json?.body?.data?.requestId,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
