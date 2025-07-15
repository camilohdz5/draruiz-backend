import nodemailer from 'nodemailer';
import crypto from 'crypto';

export interface EmailVerificationData {
  email: string;
  token: string;
  name?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure email transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  /**
   * Generate a verification token
   */
  generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Send email verification
   */
  async sendVerificationEmail(data: EmailVerificationData): Promise<boolean> {
    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${data.token}`;
      
      const mailOptions = {
        from: `"Dr. Ruiz" <${process.env.SMTP_USER}>`,
        to: data.email,
        subject: 'Verifica tu cuenta - Dr. Ruiz',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">¡Bienvenido a Dr. Ruiz!</h2>
            <p>Hola ${data.name || 'usuario'},</p>
            <p>Gracias por registrarte en nuestra plataforma. Para completar tu registro, por favor verifica tu dirección de email haciendo clic en el siguiente enlace:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Verificar Email
              </a>
            </div>
            <p>Si el botón no funciona, puedes copiar y pegar este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
            <p>Este enlace expirará en 24 horas por seguridad.</p>
            <p>Si no solicitaste esta verificación, puedes ignorar este email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              Este es un email automático, por favor no respondas a este mensaje.
            </p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending verification email:', error);
      return false;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(data: EmailVerificationData): Promise<boolean> {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${data.token}`;
      
      const mailOptions = {
        from: `"Dr. Ruiz" <${process.env.SMTP_USER}>`,
        to: data.email,
        subject: 'Restablecer contraseña - Dr. Ruiz',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Restablecer Contraseña</h2>
            <p>Hola ${data.name || 'usuario'},</p>
            <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Restablecer Contraseña
              </a>
            </div>
            <p>Si el botón no funciona, puedes copiar y pegar este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            <p>Este enlace expirará en 1 hora por seguridad.</p>
            <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              Este es un email automático, por favor no respondas a este mensaje.
            </p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return false;
    }
  }
}

export const emailService = new EmailService(); 