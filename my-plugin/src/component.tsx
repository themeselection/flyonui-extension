import {
  Badge,
  Button,
  Panel,
  PanelContent,
  PanelHeader,
  useToolbar
} from '@stagewise/plugin-sdk';

export const ExampleComponent = () => {
  const toolbar = useToolbar();

  return (
    <Panel>
      <PanelHeader title="Example Plugin" />
      <PanelContent>
        Welcome to the template plugin!
        <Button
          onClick={() => {
            console.log('Button clicked! Sending prompt to agent...');
            toolbar.sendPrompt({
              contentItems: [
                {
                  type: 'text',
                  text: "Hello Agent! This is just a test prompt. Could you please repsond with 'Hello toolbar plugin!'",
                },
              ],
            });
          }}
        >
          Send "Hello world!" to the agent!
        </Button>

        <Badge color="primary" >
          New
        </Badge>
      </PanelContent>
    </Panel>
  );
};
