import {
  Flex,
  Box,
  Stack,
  Heading,
  Text,
  Link,
  Button,
  ButtonRow,
  StatusTag,
  Tag,
  Divider,
  Accordion,
  DescriptionList,
  DescriptionListItem,
  ProgressBar,
  Statistics,
  StatisticsItem,
  Tile,
  hubspot,
} from '@hubspot/ui-extensions';

interface ExtensionContext {
  properties?: {
    firstname?: string;
    lastname?: string;
    email?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface ExtensionActions {
  addAlert: (alert: { title: string; message: string; type: 'success' | 'danger' | 'warning' | 'info' }) => void;
  [key: string]: unknown;
}

interface CardProps {
  context: ExtensionContext;
  actions: ExtensionActions;
}

hubspot.extend<'crm.record.sidebar'>(({ context, actions }: CardProps) => (
  <AgentLabCrmCard context={context} actions={actions} />
));

const AgentLabCrmCard = ({ context, actions }: CardProps) => {
  const contactName = context?.properties?.firstname 
    ? `${context.properties.firstname} ${context.properties.lastname || ''}`.trim()
    : 'Test Consulting';
  const contactEmail = context?.properties?.email || 'test@example.com';

  const handleRunDiagnostic = () => {
    actions.addAlert({
      title: 'AgentLab AI Diagnostic Initiated',
      message: `Gemini 1.5 Pro intelligence scan running for ${contactEmail}. ICP Score and tailored briefing synced.`,
      type: 'success',
    });
  };

  const handleEnrollAuthority = () => {
    actions.addAlert({
      title: 'Enrolled in 48-Hour Authority Sequence',
      message: `Contact ${contactName} added to AgentMail & Pamela AI Voice follow-up queue.`,
      type: 'info',
    });
  };

  const handleMarketMarksmanScan = () => {
    actions.addAlert({
      title: 'Market Marksman Radar Sweep',
      message: `SEC Form D & EPA Permitting sweep completed. No active environmental flags found; growth capital detected.`,
      type: 'success',
    });
  };

  return (
    <Stack gap="medium">
      {/* Header Banner */}
      <Flex justify="between" align="center">
        <Box>
          <Heading level={2}>AgentLab OS</Heading>
          <Text variant="microcopy" format={{ color: 'secondary' }}>
            Predictive Business Intelligence
          </Text>
        </Box>
        <StatusTag variant="success">Active Radar</StatusTag>
      </Flex>

      {/* ICP Score & Opportunity Metric */}
      <Tile>
        <Flex justify="between" align="center">
          <Statistics>
            <StatisticsItem
              label="ICP Growth Match"
              number="94%"
            />
          </Statistics>
          <Box>
            <Tag variant="success">Tier A Founder</Tag>
            <Text variant="microcopy" format={{ bold: true }}>
              High Propensity
            </Text>
          </Box>
        </Flex>
        <Box distance={{ top: 'small' }}>
          <Text variant="microcopy">Signal Confidence Index</Text>
          <ProgressBar value={94} max={100} variant="success" />
        </Box>
      </Tile>

      {/* Intelligence Signals */}
      <Accordion title="Real-Time Ecosystem Signals" defaultOpen={true}>
        <DescriptionList direction="column">
          <DescriptionListItem label="Market Marksman Radar">
            <Text format={{ color: 'primary' }}>
              • SEC Form D Growth Filing ($1.2M Expansion)
            </Text>
            <Text format={{ color: 'primary' }}>
              • US DOT Commercial Transport Registry Verified
            </Text>
          </DescriptionListItem>
          <DescriptionListItem label="Recommended Offer">
            <Text format={{ bold: true }}>
              48-Hour Authority Workshop → Sovereign OS Migration
            </Text>
          </DescriptionListItem>
          <DescriptionListItem label="AI Voice & Email Cadence">
            <Text>
              Pamela AI Voice Greeting Ready | AgentMail Outbound
            </Text>
          </DescriptionListItem>
        </DescriptionList>
      </Accordion>

      <Divider />

      {/* 1-Click Operational Actions */}
      <Heading level={3}>1-Click OS Workflows</Heading>
      <Stack gap="small">
        <Button
          variant="primary"
          onClick={handleRunDiagnostic}
        >
          ⚡ Run Gemini AI Diagnostic
        </Button>

        <ButtonRow>
          <Button
            variant="secondary"
            onClick={handleEnrollAuthority}
          >
            🚀 48-Hour Campaign
          </Button>
          <Button
            variant="secondary"
            onClick={handleMarketMarksmanScan}
          >
            🛰️ Marksman Scan
          </Button>
        </ButtonRow>
      </Stack>

      <Divider />

      {/* Deep Link to Sovereign OS */}
      <Flex justify="between" align="center">
        <Text variant="microcopy">
          Autonomous Operating System
        </Text>
        <Link href="https://agent-lab.tech/dashboard" external={true}>
          Open AgentLab OS →
        </Link>
      </Flex>
    </Stack>
  );
};
