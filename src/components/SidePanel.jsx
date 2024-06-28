import { Card, Button, Stack, Heading } from '@shopify/polaris';

function SidePanel() {
  return (
    <Card sectioned>
      <Stack vertical>
        <Heading>Your Otoh</Heading>
        <Button plain>Explain</Button>
        <Stack vertical spacing="loose">
          <Button plain>Manage campaigns page</Button>
          <Button plain>Brief about your current campaigns</Button>
        </Stack>
        <Heading>Create & Edit</Heading>
        <Stack vertical spacing="loose">
          <Button plain>Create a new campaign</Button>
          <Button plain>Enhance an existing campaign</Button>
        </Stack>
      </Stack>
    </Card>
  );
}

export default SidePanel;
