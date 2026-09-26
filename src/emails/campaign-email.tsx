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
  Hr,
  Link,
} from '@react-email/components';

interface CampaignEmailProps {
  subject: string;
  body: string;
  unsubscribeUrl: string;
  siteUrl?: string;
}

export const CampaignEmail: React.FC<CampaignEmailProps> = ({
  subject,
  body,
  unsubscribeUrl,
  siteUrl = 'http://localhost:3000',
}) => {
  // Split body by double linebreaks into paragraphs
  const paragraphs = body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const previewSnippet = paragraphs[0]?.slice(0, 90) || subject;

  return (
    <Html dir="rtl" lang="ar">
      <Head>
        <title>{subject}</title>
      </Head>
      <Preview>{previewSnippet}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerSection}>
            <Text style={brandLabel}>وايز هوبر • حلقة التفكير الهادئ</Text>
          </Section>

          {/* Article / Letter Content */}
          <Section style={contentSection}>
            <Heading style={heading}>{subject}</Heading>

            <Section style={bodyContent}>
              {paragraphs.map((p, idx) => (
                <Text key={idx} style={paragraph}>
                  {p}
                </Text>
              ))}
            </Section>

            <Hr style={divider} />

            <Section style={authorSection}>
              <Text style={authorName}>فريق تحرير وايز هوبر</Text>
              <Text style={authorBio}>
                مساحة مستقلة للتأمل التقني والمعماري في العصر الرقمي.
              </Text>
            </Section>
          </Section>

          {/* Footer & Compliance */}
          <Section style={footer}>
            <Text style={footerText}>
              تصلك هذه الرسالة لأنك مشترك مفعل في نشرة وايز هوبر البريدية.
            </Text>
            <Text style={footerSubText}>
              <Link href={unsubscribeUrl} style={unsubLink}>
                إلغاء الاشتراك بنقرة واحدة
              </Link>
              {' • '}
              <Link href={`${siteUrl}/newsletter`} style={subLink}>
                أرشيف النشرة
              </Link>
              {' • '}
              <Link href={siteUrl} style={subLink}>
                الرئيسية
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default CampaignEmail;

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
  padding: '40px 32px',
  boxShadow: '0 2px 8px rgba(112, 84, 212, 0.04)',
};

const heading: React.CSSProperties = {
  color: '#242035',
  fontSize: '24px',
  fontWeight: '700',
  lineHeight: '1.4',
  margin: '0 0 24px 0',
  textAlign: 'right',
};

const bodyContent: React.CSSProperties = {
  margin: '0 0 24px 0',
};

const paragraph: React.CSSProperties = {
  color: '#2D283E',
  fontSize: '16px',
  lineHeight: '1.9',
  margin: '0 0 20px 0',
  textAlign: 'right',
};

const divider: React.CSSProperties = {
  borderColor: '#E8E3F5',
  margin: '28px 0',
};

const authorSection: React.CSSProperties = {
  textAlign: 'right',
};

const authorName: React.CSSProperties = {
  color: '#242035',
  fontSize: '14px',
  fontWeight: '700',
  margin: '0 0 4px 0',
};

const authorBio: React.CSSProperties = {
  color: '#706B80',
  fontSize: '12px',
  lineHeight: '1.6',
  margin: 0,
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
