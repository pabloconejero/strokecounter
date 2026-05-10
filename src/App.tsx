import { useEffect, useState } from 'react';
import './App.css';
import type { Round } from './state/types';
import {
  appendHistory,
  clearInProgress,
  loadStorage,
  saveInProgress,
} from './state/storage';
import { HomeScreen } from './screens/HomeScreen';
import { SetupScreen } from './screens/SetupScreen';
import { PlayScreen } from './screens/PlayScreen';
import { SummaryScreen } from './screens/SummaryScreen';

type View = 'home' | 'setup' | 'play' | 'summary';

function App() {
  const initial = loadStorage();
  const [active, setActive] = useState<Round | null>(initial.inProgress);
  const [historyCount, setHistoryCount] = useState<number>(initial.history.length);
  const [view, setView] = useState<View>('home');

  useEffect(() => {
    if (active === null) {
      clearInProgress();
    } else {
      saveInProgress(active);
    }
  }, [active]);

  const handleStartNew = () => {
    setActive(null);
    setView('setup');
  };

  const handleContinue = () => {
    if (!active) return;
    setView(active.completedAt ? 'summary' : 'play');
  };

  const handleSetupDone = (round: Round) => {
    setActive(round);
    setView('play');
  };

  const handlePlayChange = (next: Round) => {
    setActive(next);
  };

  const handleFinish = (finished: Round) => {
    setActive(finished);
    setView('summary');
  };

  const handleSave = () => {
    if (!active) return;
    const updated = appendHistory(active);
    setHistoryCount(updated.length);
    setActive(null);
    setView('home');
  };

  const handleDiscard = () => {
    if (!active) return;
    if (!window.confirm('Discard this round? It will not be saved to your history.')) return;
    setActive(null);
    setView('home');
  };

  const handleCancelSetup = () => {
    setView('home');
  };

  return (
    <div className="app">
      {view === 'home' && (
        <HomeScreen
          inProgress={active}
          historyCount={historyCount}
          onContinue={handleContinue}
          onStart={handleStartNew}
        />
      )}
      {view === 'setup' && (
        <SetupScreen onCancel={handleCancelSetup} onStart={handleSetupDone} />
      )}
      {view === 'play' && active && (
        <PlayScreen round={active} onChange={handlePlayChange} onFinish={handleFinish} />
      )}
      {view === 'summary' && active && (
        <SummaryScreen round={active} onSave={handleSave} onDiscard={handleDiscard} />
      )}
    </div>
  );
}

export default App;
