'use client';

import { useState, useEffect } from "react";

interface Countdown {
  id: string;
  type: 'min' | 'max';
  targetTime: string;
  timeRemaining: string;
  isFinished: boolean;
}

export default function Home() {
  const [startTime, setStartTime] = useState("");
  const [minEndTime, setMinEndTime] = useState("");
  const [maxEndTime, setMaxEndTime] = useState("");
  const [countdowns, setCountdowns] = useState<Countdown[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Calculate end times when start time changes
  useEffect(() => {
    if (startTime) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 500);

      const [hours, minutes] = startTime.split(':').map(Number);
      const startDate = new Date();
      startDate.setHours(hours, minutes, 0, 0);

      // Minimum: 7.6 Stunden Arbeit + 30 Min Pause = 8.1 Stunden
      const minDate = new Date(startDate.getTime() + (7.6 * 60 + 30) * 60 * 1000);
      
      // Maximum: 9 Stunden Arbeit + 30 Min Pause = 9.5 Stunden
      const maxDate = new Date(startDate.getTime() + (9 * 60 + 30) * 60 * 1000);

      setMinEndTime(formatTime(minDate));
      setMaxEndTime(formatTime(maxDate));

      return () => clearTimeout(timer);
    } else {
      setMinEndTime("");
      setMaxEndTime("");
      setCountdowns([]);
    }
  }, [startTime]);

  // Update countdown timers every second
  useEffect(() => {
    if (countdowns.length === 0) return;

    const interval = setInterval(() => {
      setCountdowns(prev => prev.map(countdown => {
        const now = new Date();
        const [targetHours, targetMinutes] = countdown.targetTime.split(':').map(Number);
        const targetDate = new Date();
        targetDate.setHours(targetHours, targetMinutes, 0, 0);

        const diff = targetDate.getTime() - now.getTime();

        if (diff <= 0) {
          return { ...countdown, timeRemaining: '00:00:00', isFinished: true };
        }

        const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
        const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secondsLeft = Math.floor((diff % (1000 * 60)) / 1000);

        return {
          ...countdown,
          timeRemaining: `${String(hoursLeft).padStart(2, '0')}:${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`,
          isFinished: false,
        };
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [countdowns.length]);

  const startCountdown = (type: 'min' | 'max') => {
    const targetTime = type === 'min' ? minEndTime : maxEndTime;
    const existingCountdown = countdowns.find(c => c.type === type);
    
    if (existingCountdown) return; // Already exists

    const countdown: Countdown = {
      id: Date.now().toString(),
      type,
      targetTime,
      timeRemaining: '00:00:00',
      isFinished: false,
    };

    setCountdowns([...countdowns, countdown]);
  };

  const deleteCountdown = (id: string) => {
    setCountdowns(countdowns.filter(c => c.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background circles */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <main className="w-full max-w-4xl relative z-10 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 animate-gradient drop-shadow-lg">
            ⏰ Arbeitszeit Rechner
          </h1>
          <p className="text-white/90 text-lg drop-shadow">
            Gib deine Startzeit ein und starte deine Countdowns!
          </p>
        </div>

        {/* Calculator Card */}
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 mb-8">
          {/* Input Section */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              🕐 Startzeit
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-6 py-4 text-2xl font-semibold text-gray-800 bg-gradient-to-r from-purple-50 to-pink-50 border-3 border-purple-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-transparent transition-all duration-300 shadow-md hover:shadow-lg"
            />
          </div>

          {/* Results Section */}
          {startTime && (
            <div className={`space-y-4 transition-all duration-500 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
              {/* Minimum Time */}
              <div className="bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-2xl p-6 shadow-lg transform hover:scale-[1.02] transition-all duration-300 hover:shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-white text-sm font-semibold mb-1 flex items-center gap-2">
                      ✅ Mindestarbeitszeit (7,6h)
                    </p>
                    <p className="text-white/80 text-xs">
                      inkl. 30 Min Pause
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-white">
                      {minEndTime}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => startCountdown('min')}
                  disabled={countdowns.some(c => c.type === 'min')}
                  className="w-full bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {countdowns.some(c => c.type === 'min') ? '✓ Countdown läuft' : '⏱️ Countdown starten'}
                </button>
              </div>

              {/* Maximum Time */}
              <div className="bg-gradient-to-r from-orange-400 to-rose-400 rounded-2xl p-6 shadow-lg transform hover:scale-[1.02] transition-all duration-300 hover:shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-white text-sm font-semibold mb-1 flex items-center gap-2">
                      🔥 Maximalarbeitszeit (9h)
                    </p>
                    <p className="text-white/80 text-xs">
                      inkl. 30 Min Pause
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-white">
                      {maxEndTime}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => startCountdown('max')}
                  disabled={countdowns.some(c => c.type === 'max')}
                  className="w-full bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {countdowns.some(c => c.type === 'max') ? '✓ Countdown läuft' : '⏱️ Countdown starten'}
                </button>
              </div>

              {/* Info Box */}
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-5 border-2 border-blue-200">
                <p className="text-sm text-gray-700 text-center">
                  ⏳ <strong>Hinweis:</strong> Die 30 Minuten Pause sind bereits eingerechnet
                </p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!startTime && (
            <div className="text-center py-12 animate-bounce-slow">
              <div className="text-6xl mb-4">🚀</div>
              <p className="text-gray-500 text-lg">
                Wähle eine Startzeit, um loszulegen!
              </p>
            </div>
          )}
        </div>

        {/* Active Countdowns */}
        {countdowns.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white text-center mb-4 drop-shadow-lg">
              🎯 Aktive Countdowns
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {countdowns.map((countdown) => (
                <div
                  key={countdown.id}
                  className={`bg-gradient-to-r ${countdown.type === 'min' ? 'from-emerald-400 to-cyan-400' : 'from-orange-400 to-rose-400'} rounded-3xl p-6 shadow-xl transform hover:scale-105 transition-all duration-300 hover:shadow-2xl ${countdown.isFinished ? 'animate-pulse-slow' : ''}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{countdown.type === 'min' ? '✅' : '🔥'}</span>
                        <h3 className="text-xl font-bold text-white">
                          {countdown.type === 'min' ? 'Mindestzeit' : 'Maximalzeit'}
                        </h3>
                      </div>
                      <p className="text-white/80 text-sm">
                        Zielzeit: {countdown.targetTime}
                      </p>
                      <p className="text-white/70 text-xs mt-1">
                        {countdown.type === 'min' ? '7,6h + 30 Min' : '9h + 30 Min'}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteCountdown(countdown.id)}
                      className="bg-white/20 hover:bg-white/30 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
                    {countdown.isFinished ? (
                      <div>
                        <p className="text-white font-bold text-2xl mb-1">🎉 Fertig!</p>
                        <p className="text-white/90 text-sm">Du kannst jetzt gehen!</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-white/90 text-sm mb-1">Noch:</p>
                        <p className="text-white font-bold text-5xl font-mono tracking-wide">
                          {countdown.timeRemaining}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
