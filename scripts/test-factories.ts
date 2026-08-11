import { factories } from '../server/_core/autonoma/factories';
import { buildSchemaFromFactories } from '@autonoma-ai/sdk';
try {
  const schema = buildSchemaFromFactories(factories as any, 'testRunId');
  console.log('Success! Models count:', schema.models.length);
} catch (e) {
  console.error(e);
}
