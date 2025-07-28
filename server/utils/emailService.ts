
import nodemailer from 'nodemailer';

// Configure o transporter de email
const createTransporter = () => {
  // Para Gmail ou outros provedores, você pode usar SMTP
  return nodemailer.createTransporter({
    service: 'gmail', // ou 'hotmail', 'outlook', etc.
    auth: {
      user: process.env.EMAIL_USER, // seu email para envio
      pass: process.env.EMAIL_PASS, // senha de app ou senha normal
    },
  });
};

export async function sendSupportEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
  type: string;
  siteUrl?: string;
}) {
  try {
    const transporter = createTransporter();
    
    const typeLabels = {
      support: 'Suporte Técnico',
      contact: 'Contato Geral',
      feedback: 'Feedback',
      bug: 'Relatório de Bug',
      feature: 'Solicitação de Funcionalidade'
    };

    const typeLabel = typeLabels[data.type as keyof typeof typeLabels] || 'Contato';

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'rafaelhorvan@hotmail.com',
      subject: `[${typeLabel}] ${data.subject} - Site Dra. Adrielle`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ec4899; border-bottom: 2px solid #ec4899; padding-bottom: 10px;">
            Nova Mensagem de ${typeLabel}
          </h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Informações do Contato:</h3>
            <p><strong>Nome:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Tipo:</strong> ${typeLabel}</p>
            <p><strong>Assunto:</strong> ${data.subject}</p>
            <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
            ${data.siteUrl ? `<p><strong>Site:</strong> <a href="${data.siteUrl}">${data.siteUrl}</a></p>` : ''}
          </div>

          <div style="background: white; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #333;">Mensagem:</h3>
            <div style="white-space: pre-wrap; line-height: 1.6; color: #555;">
${data.message}
            </div>
          </div>

          <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px; font-size: 14px; color: #666;">
            <p style="margin: 0;"><strong>💡 Dica:</strong> Você pode responder diretamente a este email para entrar em contato com ${data.name}.</p>
          </div>
        </div>
      `,
      replyTo: data.email, // Para facilitar a resposta
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email enviado com sucesso:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return { success: false, error: error.message };
  }
}
