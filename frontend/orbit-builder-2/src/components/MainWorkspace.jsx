import React, { useState, useRef, useEffect, useContext } from 'react';
import YouTube from 'react-youtube';
import SpaceTimeline from './SpaceTimeline';
import CodeEditor from './CodeEditor';
import { Maximize, Zap } from 'lucide-react';

// 🔥 IMPORTED YOUR DEEP SPACE AND SHOOTING STARS
import DeepSpace from './DeepSpace';
import ShootingStar from './ShootingStar';

import { getCurriculumByDay, getStudentProgress } from '../api';
import { AppContext } from '../context/AppContext';

export default function MainWorkspace() {
  const { user } = useContext(AppContext);
  const studentId = user?.email || (JSON.parse(localStorage.getItem('orbit_user')) || {}).email || 'dev@company.com';

  const [topics, setTopics] = useState([]);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);

  const [isLoading, setIsLoading] = useState(true);

  const [phase, setPhase] = useState('flying');
  const [videoInterrupted, setVideoInterrupted] = useState(false);
  const [currentCheckpointIndex, setCurrentCheckpointIndex] = useState(0);

  // TEMPORARY FIX: Clear localStorage so stale checkpoint IDs from old curriculum tests don't permanently skip the new ones
  localStorage.removeItem('orbit_completed_cps');

  const [completedCheckpoints, setCompletedCheckpoints] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('orbit_completed_cps') || '[]'));
    } catch {
      return new Set();
    }
  });

  const playerRef = useRef(null);
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    const loadCurriculum = async () => {
      try {
        const progressData = await getStudentProgress(studentId);

        // Filter to only unlocked days, then fetch their curriculum mapping
        const unlockedDays = progressData.days.filter(d => d.is_unlocked);

        const fullTopics = await Promise.all(
          unlockedDays.map(async (day, index) => {
            const data = await getCurriculumByDay(day.day_id).catch(() => null);
            if (!data || !data.checkpoints) return null;

            const mappedCheckpoints = data.checkpoints.map((cp, idx) => ({
              id: cp.checkpoint_id,
              time: cp.timestamp_seconds,
              title: cp.topic,
              description: cp.context_summary,
              template: cp.starter_code,
              isFinal: idx === data.checkpoints.length - 1
            }));

            return {
              id: index,
              title: data.video_title,
              videoId: data.video_id,
              checkpoints: mappedCheckpoints
            };
          })
        );

        setTopics(fullTopics.filter(Boolean));
      } catch (e) {
        console.error("Failed to fetch curriculum", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadCurriculum();

    return () => clearInterval(progressIntervalRef.current);
  }, [studentId]);

  const currentTopic = topics[currentTopicIndex];
  const isCourseComplete = topics.length > 0 && currentTopicIndex >= topics.length;

  const handleArrival = () => {
    setPhase('video');
    if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
      playerRef.current.playVideo();
    }
  };

  const startProgressTracker = (player) => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    progressIntervalRef.current = setInterval(() => {
      if (videoInterrupted || !currentTopic) return;

      const currentTime = player.getCurrentTime();

      const nextCpIndex = currentTopic.checkpoints.findIndex((cp) =>
        !completedCheckpoints.has(cp.id) && currentTime >= cp.time
      );

      if (nextCpIndex !== -1) {
        setCurrentCheckpointIndex(nextCpIndex);
        player.pauseVideo();
        setVideoInterrupted(true);
        clearInterval(progressIntervalRef.current);
      }
    }, 1000);
  };

  const onPlayerReady = (event) => {
    playerRef.current = event.target;
    if (phase === 'video') {
      event.target.playVideo();
    }
  };

  const onPlayerStateChange = (event) => {
    if (event.data === 1 && !videoInterrupted) {
      startProgressTracker(event.target);
    } else {
      clearInterval(progressIntervalRef.current);
    }
  };

  const enterFullscreenIDE = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(e => console.log(e));
    }
    setPhase('ide');
  };

  const handleIdeSuccess = () => {
    if (document.exitFullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch(e => console.log(e));
    }

    const currentCheckpoint = currentTopic.checkpoints[currentCheckpointIndex];

    setCompletedCheckpoints(prev => {
      const updated = new Set(prev);
      updated.add(currentCheckpoint.id);
      localStorage.setItem('orbit_completed_cps', JSON.stringify([...updated]));

      const allCompleted = currentTopic.checkpoints.every(cp => updated.has(cp.id));

      if (!allCompleted) {
        setPhase('video');
        setVideoInterrupted(false);
        if (playerRef.current) {
          playerRef.current.seekTo(currentCheckpoint.time + 2);
          playerRef.current.playVideo();
        }
      } else {
        setVideoInterrupted(false);
        setPhase('flying');
        setCurrentTopicIndex(prevTopic => prevTopic + 1);
      }
      return updated;
    });
  };

  if (isLoading) {
    return <div className="w-screen h-screen bg-black flex items-center justify-center text-cyan-400 font-mono">LOADING CURRICULUM DATA...</div>;
  }

  if (isCourseComplete) {
    return (
      <div className="w-screen h-screen bg-black/70 flex flex-col items-center justify-center font-sans text-white overflow-hidden relative backdrop-blur-sm">
        <div className="z-10 text-center flex flex-col items-center max-w-2xl p-8 bg-[#1D2A35]/90 rounded-2xl border border-[#04AA6D]/30 shadow-[0_0_50px_rgba(4,170,109,0.1)]">
          <div className="w-24 h-24 mb-6 rounded-full bg-[#04AA6D]/20 flex items-center justify-center border-2 border-[#04AA6D] shadow-[0_0_30px_rgba(4,170,109,0.4)] animate-bounce">
            <svg className="w-12 h-12 text-[#04AA6D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-widest uppercase">Sector Cleared</h1>
          <h2 className="text-xl font-bold text-[#04AA6D] mb-6 tracking-widest uppercase">Orbit Secure Clearance Granted</h2>
          <button onClick={() => window.location.reload()} className="px-8 py-4 bg-[#04AA6D] hover:bg-[#059862] text-white font-bold rounded-lg uppercase tracking-[0.2em] shadow-lg transition-all">
            Return to Base
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="relative w-screen h-screen overflow-hidden text-white" style={{ background: 'transparent' }}>

      <div className="absolute inset-0 z-[2]">
        <SpaceTimeline
          currentTopicIndex={currentTopicIndex}
          isFlying={phase === 'flying'}
          onArrival={handleArrival}
        />
      </div>

      <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center transition-opacity duration-500 ${phase === 'video' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>

        <div className="relative w-full h-full overflow-hidden" style={{ background: 'transparent' }}>

          <div className={`absolute inset-0 ${videoInterrupted ? 'opacity-0 pointer-events-none' : 'opacity-100 bg-black'} transition-opacity duration-300`}>
            {currentTopic && (
              <YouTube
                videoId={currentTopic.videoId}
                opts={{
                  width: '100%',
                  height: '100%',
                  playerVars: { autoplay: 0, modestbranding: 1, rel: 0, origin: typeof window !== 'undefined' ? window.location.origin : '' }
                }}
                className="absolute top-0 left-0 w-full h-full"
                iframeClassName="w-full h-full"
                onReady={onPlayerReady}
                onStateChange={onPlayerStateChange}
              />
            )}
          </div>

          {videoInterrupted && (
            // 🔥 REMOVED THE BLUR, ADDED A SOLID BACKGROUND SO IT HIDES THE SPACESHIP COMPLETELY
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-500 overflow-hidden">

              {/* 🔥 ADDED YOUR DEEP SPACE AND SHOOTING STAR HERE */}
              <div className="absolute inset-0 z-0 bg-[#020617]">
                <DeepSpace />
                <ShootingStar />
              </div>

              <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, black 2px, black 4px)' }}></div>

              {/* EVERYTHING ELSE SITS ABOVE THE STARS (z-30) */}
              <div className="relative z-30 flex flex-col items-center">
                <div className="w-20 h-20 mb-6 flex items-center justify-center text-cyan-400 relative">
                  <div className="absolute inset-0 rounded-full bg-cyan-500/10 animate-pulse border border-cyan-500/30"></div>
                  <Zap className="w-10 h-10 animate-pulse" strokeWidth={1.5} />
                </div>

                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-[0.2em] mb-2 text-white">
                  Signal <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-indigo-400 animate-pulse">Intercepted</span>
                </h2>
                <h3 className="text-lg font-bold text-amber-400 mb-10 tracking-widest uppercase px-4 py-1.5 bg-amber-400/10 rounded-full border border-amber-400/20">
                  {currentTopic?.checkpoints[currentCheckpointIndex]?.title}
                </h3>

                <div className="max-w-md p-6 bg-[#1D2A35]/80 rounded-xl border border-[#38444D] mb-12 shadow-2xl">
                  <p className="text-slate-300 mb-6 leading-relaxed text-sm">
                    A planetary encryption protocol has been triggered. Transmission cannot resume until you bypass the security matrix in the secure terminal. Failure will result in signal loss.
                  </p>
                </div>

                <button
                  onClick={enterFullscreenIDE}
                  className="group flex items-center gap-3 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white px-10 py-4 rounded font-bold text-lg hover:from-cyan-500 hover:to-indigo-500 transition-all shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:shadow-[0_0_50px_rgba(34,211,238,0.5)] transform hover:scale-105"
                >
                  <Maximize className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                  INITIATE SECURE TERMINAL LINK
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {phase === 'ide' && (
        <div className="fixed inset-0 z-[9999] bg-[#282A35] w-screen h-screen flex flex-col">
          <div className="w-full h-12 bg-[#15202B] border-b border-[#38444D] flex items-center px-4 justify-between shrink-0 shadow-md">
            <span className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
              Orbit Secure Terminal <span className="text-[#A0AAB2] mx-2">|</span> {currentTopic?.title}
            </span>
          </div>
          <div className="flex-grow relative overflow-hidden flex items-center justify-center">
            {currentTopic && (
              <CodeEditor
                onComplete={handleIdeSuccess}
                buttonText="Resume Transmission"
                checkpointId={currentTopic.checkpoints[currentCheckpointIndex]?.id}
                questionData={currentTopic.checkpoints[currentCheckpointIndex]}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}