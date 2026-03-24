import { siteConfig } from "@/lib/constants/site";

const resendApiKey = process.env.RESEND_API_KEY;
const inviteFromEmail = process.env.ADMIN_INVITE_FROM_EMAIL;
const inviteReplyToEmail = process.env.ADMIN_INVITE_REPLY_TO_EMAIL;
const inviteBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || siteConfig.url;

type SendAdminInviteEmailInput = {
  email: string;
  expiresAt: string;
};

function buildInviteEmailHtml(input: SendAdminInviteEmailInput) {
  const registerUrl = `${inviteBaseUrl}/auth/register`;

  return `
    <div style="margin:0;padding:0;background:#0b1020;font-family:Inter,Arial,sans-serif;color:#e5eefc;">
      <div style="max-width:640px;margin:0 auto;padding:32px 20px;">
        <div style="border:1px solid rgba(255,255,255,0.08);border-radius:24px;overflow:hidden;background:linear-gradient(180deg,#121a2b 0%,#0c1220 100%);box-shadow:0 24px 80px rgba(0,0,0,0.32);">
          <div style="padding:32px 32px 20px;background:linear-gradient(135deg,#0f172a 0%,#1d4ed8 55%,#4f46e5 100%);">
            <div style="display:inline-block;padding:8px 14px;border-radius:999px;background:rgba(255,255,255,0.12);font-size:12px;font-weight:700;letter-spacing:0.18em;color:#ffffff;">
              ADMIN INVITATION
            </div>
            <h1 style="margin:18px 0 0;font-size:32px;line-height:1.1;font-weight:800;color:#ffffff;">
              LỜI MỜI TẠO TÀI KHOẢN QUẢN TRỊ VFuture
            </h1>
            <p style="margin:14px 0 0;font-size:15px;line-height:1.7;color:rgba(255,255,255,0.86);">
              Email <strong style="color:#ffffff;">${input.email}</strong> đã được cấp quyền tạo tài khoản quản trị.
            </p>
          </div>

          <div style="padding:32px;">
            <div style="border:1px solid rgba(96,165,250,0.26);border-radius:18px;background:rgba(37,99,235,0.08);padding:18px 20px;">
              <p style="margin:0 0 10px;font-size:13px;font-weight:700;letter-spacing:0.12em;color:#93c5fd;">
                THỜI HẠN LỜI MỜI
              </p>
              <p style="margin:0;font-size:15px;line-height:1.7;color:#dbeafe;">
                Lời mời sẽ hết hạn lúc <strong style="color:#ffffff;">${new Date(input.expiresAt).toLocaleString("vi-VN")}</strong>.
                Nếu quá 48 giờ mà chưa tạo tài khoản, vui lòng liên hệ quản trị viên để cấp lại thư mời.
              </p>
            </div>

            <div style="margin-top:24px;">
              <a href="${registerUrl}" style="display:inline-block;padding:14px 24px;border-radius:14px;background:linear-gradient(135deg,#2563eb,#4f46e5);color:#ffffff;text-decoration:none;font-size:14px;font-weight:800;letter-spacing:0.08em;">
                TẠO TÀI KHOẢN ADMIN
              </a>
            </div>

            <div style="margin-top:24px;font-size:14px;line-height:1.8;color:#cbd5e1;">
              <p style="margin:0 0 8px;">HUONG DAN:</p>
              <p style="margin:0;">1. Mở trang tạo tài khoản.</p>
              <p style="margin:0;">2. Dùng đúng email đã được mời.</p>
              <p style="margin:0;">3. Hoàn tất đăng ký và đăng nhập vào trang quản trị.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export async function sendAdminInviteEmail(input: SendAdminInviteEmailInput) {
  if (!resendApiKey || !inviteFromEmail) {
    return {
      sent: false,
      configured: false,
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: inviteFromEmail,
      to: [input.email],
      reply_to: inviteReplyToEmail || undefined,
      subject: "Lời mời tạo tài khoản quản trị VFuture",
      html: buildInviteEmailHtml(input),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return {
      sent: false,
      configured: true,
      error: errorText,
    };
  }

  return {
    sent: true,
    configured: true,
  };
}
