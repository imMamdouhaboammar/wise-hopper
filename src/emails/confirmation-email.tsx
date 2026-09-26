import React from 'react';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Hr,
  Link,
} from '@react-email/components';

interface ConfirmationEmailProps {
  confirmationUrl: string;
  siteUrl?: string;
}

export const ConfirmationEmail: React.FC<ConfirmationEmailProps> = ({
  confirmationUrl,
  siteUrl = 'http://localhost:3000',
}) => {
  return (
    <Html dir="rtl" lang="ar">
      <Head>
        <title>تأكيد اشتراكك في النشرة البريدية | وايز هوبر</title>
      </Head>
      <Preview>يرجى تأكيد رغبتك بالانضمام إلى حلقة التفكير الهادئ لتفعيل اشتراكك</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerSection}>
            <Text style={brandLabel}>وايز هوبر • حلقة التفكير الهادئ</Text>
          </Section>

          {/* Card Content */}
          <Section style={contentSection}>
            <Heading style={heading}>مرحباً بك في مجتمع القراء الهادئ</Heading>
            <Text style={paragraph}>
              شكراً لاهتمامك بالانضمام إلى النشرة البريدية. يرجى تأكيد رغبتك بالضغط على الزر أدناه لتفعيل اشتراكك:
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={confirmationUrl}>
                تأكيد الاشتراك
              </Button>
            </Section>

            <Text style={disclaimer}>
              هذا الرابط صالح لمدة 24 ساعة فقط. إذا لم تطلب هذا الاشتراك، يمكنك تجاهل هذه الرسالة بأمان دون اتخاذ أي إجراء.
            </Text>

            <Hr style={divider} />

            <Text style={footerNote}>
              إذا واجهت مشكلة في الضغط على الزر، يمكنك نسخ الرابط التالي ولصقه في متصفحك:
              <br />
              <Link href={confirmationUrl} style={link}>
                {confirmationUrl}
              </Link>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              منصة وايز هوبر للنشر المستقل • نشرة فكرية ومعمارية هادئة
            </Text>
            <Text style={footerSubText}>
              <Link href={siteUrl} style={subLink}>
                زيارة الموقع
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ConfirmationEmail;

const main: React.CSSProperties = {
  backgroundColor: '#F8F6FF',
  fontFamily: "'IBM Plex Sans Arabic', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  direction: 'rtl',
  textAlign: 'right',
  margin: 0,
  padding: '40px 16px',
};

const container: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
};

const headerSection: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '24px',
};

const brandLabel: React.CSSProperties = {
  color: '#7054D4',
  fontSize: '14px',
  fontWeight: 'bold',
  letterSpacing: '0.5px',
  margin: 0,
};

const contentSection: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  borderRadius: '24px',
  border: '1px solid #E8E3F5',
  padding: '36px 32px',
  boxShadow: '0 2px 8px rgba(112, 84, 212, 0.04)',
};

const heading: React.CSSProperties = {
  color: '#242035',
  fontSize: '22px',
  fontWeight: '700',
  lineHeight: '1.4',
  margin: '0 0 16px 0',
  textAlign: 'right',
};

const paragraph: React.CSSProperties = {
  color: '#4B465C',
  fontSize: '15px',
  lineHeight: '1.8',
  margin: '0 0 24px 0',
  textAlign: 'right',
};

const buttonContainer: React.CSSProperties = {
  textAlign: 'center',
  margin: '32px 0',
};

const button: React.CSSProperties = {
  backgroundColor: '#7054D4',
  color: '#FFFFFF',
  borderRadius: '12px',
  fontSize: '15px',
  fontWeight: 'bold',
  textDecoration: 'none',
  padding: '14px 32px',
  display: 'inline-block',
};

const disclaimer: React.CSSProperties = {
  color: '#706B80',
  fontSize: '13px',
  lineHeight: '1.6',
  margin: '24px 0 0 0',
  textAlign: 'right',
};

const divider: React.CSSProperties = {
  borderColor: '#E8E3F5',
  margin: '24px 0',
};

const footerNote: React.CSSProperties = {
  color: '#706B80',
  fontSize: '12px',
  lineHeight: '1.6',
  margin: 0,
  textAlign: 'right',
};

const link: React.CSSProperties = {
  color: '#7054D4',
  textDecoration: 'underline',
  wordBreak: 'break-all',
  direction: 'ltr',
  display: 'inline-block',
  marginTop: '6px',
};

const footer: React.CSSProperties = {
  textAlign: 'center',
  marginTop: '28px',
};

const footerText: React.CSSProperties = {
  color: '#706B80',
  fontSize: '12px',
  margin: '0 0 6px 0',
};

const footerSubText: React.CSSProperties = {
  color: '#706B80',
  fontSize: '12px',
  margin: 0,
};

const subLink: React.CSSProperties = {
  color: '#7054D4',
  textDecoration: 'underline',
};
