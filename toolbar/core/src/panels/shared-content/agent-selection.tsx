import { Button } from '@/components/ui/button';
import { useAgents } from '@/hooks/agent/use-agent-provider';
import { cn } from '@/utils';
import { RefreshCwIcon } from 'lucide-react';

export function AgentSelection({
  showConnectedDetails = false,
}: {
  showConnectedDetails?: boolean;
}) {
  const {
    connected,
    isRefreshing,
    availableAgents,
    connectAgent,
    isAppHostedAgent,
    refreshAgentList,
  } = useAgents();

  const handleAgentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const port = Number.parseInt(e.target.value);
    if (port) {
      connectAgent(port);
    }
  };

  const handleRefresh = () => {
    if (isRefreshing) return; // Prevent multiple refreshes
    return refreshAgentList();
  };

  // Use stable placeholder text that doesn't change during refresh to prevent layout shifts
  const placeholderText =
    availableAgents.length > 0 ? 'Select an agent...' : 'No agents available';

  // For app-hosted agents, only show the connected agent info
  if (isAppHostedAgent) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Agent Selection Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <label
          htmlFor="agent-select"
          className="font-medium text-foreground text-sm"
        >
          Agent
        </label>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="h-6 w-6 p-0"
        >
          <RefreshCwIcon
            className={cn(
              'size-3',
              isRefreshing && 'animate-spin',
              'text-muted-foreground hover:text-foreground',
            )}
          />
        </Button>
      </div>

      {/* Agent Selection Dropdown */}
      <select
        id="agent-select"
        value={connected?.port || ''}
        onChange={handleAgentChange}
        className="h-8 w-full rounded-lg border border-zinc-950/10 bg-zinc-500/10 px-2 text-sm ring-1 ring-white/20 focus:border-zinc-500 focus:outline-none"
      >
        <option value="" disabled>
          {placeholderText}
        </option>
        {availableAgents.map((agent) => (
          <option key={agent.port} value={agent.port}>
            {agent.description}({agent.name})
          </option>
        ))}
      </select>
    </div>
  );
}
