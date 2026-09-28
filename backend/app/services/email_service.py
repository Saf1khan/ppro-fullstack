import logging
from email.message import EmailMessage
import aiosmtplib

from app.core.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    @staticmethod
    async def send_otp_email(to_email: str, otp_code: str) -> bool:
        """
        Sends a 6-digit verification OTP email through Mailpit (or configured SMTP relay).
        """
        message = EmailMessage()
        message["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
        message["To"] = to_email
        message["Subject"] = f"{otp_code} is your PadosiPro verification code"

        text_content = (
            f"Welcome to PadosiPro!\n\n"
            f"Your 6-digit verification code is: {otp_code}\n\n"
            f"This code will expire in {settings.OTP_EXPIRE_MINUTES} minutes.\n"
            f"If you did not request this verification, please ignore this email.\n"
        )

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAFAF7; color: #101828; margin: 0; padding: 24px; }}
            .container {{ max-width: 520px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E4E7EC; border-radius: 12px; padding: 32px; }}
            .brand {{ color: #155C49; font-size: 24px; font-weight: 700; margin-bottom: 16px; }}
            .code {{ font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #155C49; background: #E8F2EE; padding: 12px 24px; border-radius: 8px; text-align: center; margin: 24px 0; }}
            .footer {{ font-size: 13px; color: #667085; margin-top: 24px; line-height: 1.5; }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="brand">PadosiPro</div>
            <p>Hello,</p>
            <p>Thank you for registering with PadosiPro. Use the verification code below to verify your email address:</p>
            <div class="code">{otp_code}</div>
            <p>This code is valid for <strong>{settings.OTP_EXPIRE_MINUTES} minutes</strong> and can only be used once.</p>
            <div class="footer">
              <p>For your security, never share this code with anyone. If you didn't create a PadosiPro account, you can safely ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
        """

        message.set_content(text_content)
        message.add_alternative(html_content, subtype="html")

        try:
            await aiosmtplib.send(
                message,
                hostname=settings.SMTP_HOST,
                port=settings.SMTP_PORT,
                username=settings.SMTP_USER or None,
                password=settings.SMTP_PASSWORD or None,
                use_tls=settings.SMTP_TLS,
                timeout=10,
            )
            logger.info("Successfully sent OTP email to %s", to_email)
            return True
        except Exception as e:
            logger.error("Failed to send OTP email to %s: %s", to_email, str(e))
            # In development with Mailpit, log warning rather than halting execution
            return False


email_service = EmailService()
