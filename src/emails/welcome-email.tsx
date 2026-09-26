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

interface WelcomeEmailProps {
  manageUrl: string;
  unsubscribeUrl: string;
  topics?: string[];
  siteUrl?: string;
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({
  manageUrl,
  unsubscribeUrl,
  topics = [],
  siteUrl = 'http://localhost:3000',
}) => {
  return (
    <Html dir="rtl" lang="ar">
      <Head>
        <title>أهلاً بك في حلقة التفكير الهادئ | وايز هوبر</title>
      </Head>
      <Preview>تم تأكيد اشتراكك بنجاح! إليك ما يمكنك توقعه من النشرة</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerSection}>
            <Text style={brandLabel}>وايز هوبر • حلقة التفكير الهادئ</Text>
          </Section>

          {/* Card Content */}
          <Section style={contentSection}>
            <Heading style={heading}>تم تفعيل اشتراكك بنجاح ✨</Heading>
            <Text style={paragraph}>
              أهلاً بك معنا في حلقة التفكير الهادئ. تم تأكيد عنوان بريدك الإلكتروني بنجاح، وستتلقى من الآن فصاعداً خلاصاتنا المعمارية والمقالية المتخصصة.
            </Text>

            <Section style={infoBox}>
              <Text style={infoTitle}>ماذا تتوقع منا؟</Text>
              <Text style={infoText}>
                • عددان شهرياً يركزان على جودة المحتوى وبناء الأنظمة الموزعة والتصميم العربي الرصين.
                <br />
                • محتوى تحليلي أصيل، خالٍ تماماً من الإعلانات وحشو الكلمات.
                <br />
                • روابط مباشرة لقراءة المقالات بأعلى درجات الهدوء والتركيز.
              </Text>
            </Section>

            {topics.length > 0 && (
              <Section style={topicsSection}>
                <Text style={topicsLabel}>الموضوعات التي قمت باختيارها:</Text>
                <Text style={topicsList}>
                  {topics.join(' • ')}
                </Text>
              </Section>
            )}

            <Section style={buttonContainer}>
              <Button style={button} href={`${siteUrl}/articles`}>
                استكشف المقالات المنشورة
              </Button>
            </Section>

            <Hr style={divider} />

            <Text style={managePreferencesText}>
              يمكنك في أي وقت تحديث تفضيلات الموضوعات أو إدارة اشتراكك من خلال{' '}
              <Link href={manageUrl} style={inlineLink}>
                صفحة إدارة النشرة
              </Link>
              .
            </Text>
          </Section>

          {/* Footer & Compliance */}
          <Section style={footer}>
            <Text style={footerText}>
              تصلك هذه الرسالة لأنك أكدت اشتراكك في نشرة وايز هوبر البريدية.
            </Text>
            <Text style={footerSubText}>
              <Link href={unsubscribeUrl} style={unsubLink}>
                إلغاء الاشتراك بنقرة واحدة
              </Link>
              {' • '}
              <Link href={siteUrl} style={subLink}>
                الموقع الرئيسي
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeEmail;

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
  margin: '0 0 20px 0',
  textAlign: 'right',
};

const infoBox: React.CSSProperties = {
  backgroundColor: '#F8F6FF',
  border: '1px solid #E8E3F5',
  borderRadius: '16px',
  padding: '20px',
  margin: '20px 0',
};

const infoTitle: React.CSSProperties = {
  color: '#7054D4',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
  textAlign: 'right',
};

const infoText: React.CSSProperties = {
  color: '#4B465C',
  fontSize: '13px',
  lineHeight: '1.8',
  margin: 0,
  textAlign: 'right',
};

const topicsSection: React.CSSProperties = {
  margin: '16px 0',
};

const topicsLabel: React.CSSProperties = {
  color: '#706B80',
  fontSize: '13px',
  fontWeight: '600',
  margin: '0 0 6px 0',
  textAlign: 'right',
};

const topicsList: React.CSSProperties = {
  color: '#242035',
  fontSize: '13px',
  fontWeight: '500',
  margin: 0,
  textAlign: 'right',
};

const buttonContainer: React.CSSProperties = {
  textAlign: 'center',
  margin: '28px 0',
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

const divider: React.CSSProperties = {
  borderColor: '#E8E3F5',
  margin: '24px 0',
};

const managePreferencesText: React.CSSProperties = {
  color: '#706B80',
  fontSize: '13px',
  lineHeight: '1.6',
  margin: 0,
  textAlign: 'right',
};

const inlineLink: React.CSSProperties = {
  color: '#7054D4',
  textDecoration: 'underline',
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

const unsubLink: React.CSSProperties = {
  color: '#706B80',
  textDecoration: 'underline',
};
