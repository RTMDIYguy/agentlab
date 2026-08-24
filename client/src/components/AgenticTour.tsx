import React, { useState, useEffect } from 'react';
import { Joyride, CallBackProps, STATUS, Step } from 'react-joyride';

export function AgenticTour() {
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (!hasSeenTour) {
      // Start the tour
      setRun(true);
      
      // Fetch dynamic welcome message
      const fetchAgentWelcome = async () => {
        try {
          const res = await fetch("/api/orchestrator/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: "The user just logged in. Give them a 2-sentence welcome message explaining how the URC playbooks can automate their agency."
            })
          });
          
          let aiMessage = "Welcome to the URC Agentic Platform! Let's get your agency automated.";
          if (res.ok) {
            const data = await res.json();
            if (data.reply) {
              aiMessage = data.reply;
            }
          }
          
          setSteps([
            {
              target: '.marketplace-link',
              content: (
                <div>
                  <h3 className="font-bold text-lg mb-2">Welcome! 🤖</h3>
                  <p className="text-sm">{aiMessage}</p>
                  <p className="text-xs mt-2 text-muted-foreground">Start by exploring our Marketplace for Playbooks.</p>
                </div>
              ),
              placement: 'right',
              disableBeacon: true,
            },
            {
              target: '.command-center-link',
              content: 'The Command Center is where you orchestrate and monitor your active AI agents.',
              placement: 'right',
            },
            {
              target: '.run-workflow-btn',
              content: 'Click here to execute a workflow and let the agents do the heavy lifting!',
              placement: 'bottom',
            }
          ]);
        } catch (error) {
          console.error("Failed to fetch tour message", error);
          // Fallback steps
          setSteps([
            {
              target: '.marketplace-link',
              content: 'Welcome to the URC Agentic Platform! Start by exploring our Marketplace.',
              placement: 'right',
              disableBeacon: true,
            },
            {
              target: '.command-center-link',
              content: 'The Command Center is where you orchestrate and monitor your active AI agents.',
              placement: 'right',
            },
            {
              target: '.run-workflow-btn',
              content: 'Click here to execute a workflow and let the agents do the heavy lifting!',
              placement: 'bottom',
            }
          ]);
        }
      };
      
      fetchAgentWelcome();
    }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    
    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem('hasSeenTour', 'true');
    }
  };

  if (!run || steps.length === 0) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      scrollToFirstStep
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#f59e0b', // amber-500
          zIndex: 1000,
        },
      }}
    />
  );
}
