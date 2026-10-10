import { Panel, Screen, Section, T } from '@/components/ui';
import { UrgentHelp } from '@/features/support/UrgentHelp';
import { dataMode } from '@/services';

export default function Safety() {
  return (
    <Screen back title="Help & safety">
      <UrgentHelp />
      <Section title="What Nurture is — and isn’t">
        <T>
          Nurture helps you keep simple notes and find people who can support you. It doesn’t diagnose, interpret your logs, or
          replace your pediatrician, midwife, health visitor or emergency services.
        </T>
      </Section>
      <Section title="Where your data lives">
        <Panel>
          <T>
            {dataMode === 'demo'
              ? 'This is a demo. Your logs, questions and posts are stored only on this device, and sample content (experts, products, posts) is fictional.'
              : 'Your data is stored with the Nurture service. See the privacy policy for details.'}
          </T>
        </Panel>
      </Section>
      <Section title="Looking after yourself">
        <T>
          The early months are hard. If you’re struggling with your mood or feel unable to cope, please talk to your doctor or a
          local support line — you deserve care too.
        </T>
      </Section>
    </Screen>
  );
}
