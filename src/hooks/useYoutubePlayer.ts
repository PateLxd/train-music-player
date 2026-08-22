import { useCallback, useEffect, useRef, useState } from "react";
import { TRACKS } from "@/data/playlist";

export type RepeatMode = "off" | "all" | "one";

interface YTPlayerLike {
  loadVideoById: (id: string) => void;
  cueVideoById: (id: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  setVolume: (v: number) => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  getCurrentTime: () => number;
  getDuration: () => number;
}

function randomIndex(current: number): number {
  if (TRACKS.length <= 1) return 0;
  let n = current;
  while (n === current) n = Math.floor(Math.random() * TRACKS.length);
  return n;
}

let apiPromise: Promise<any> | null = null;

function loadYouTubeAPI(): Promise<any> {
  if (!apiPromise) {
    apiPromise = new Promise((resolve, reject) => {
      const w = window as any;
      if (w.YT && w.YT.Player) {
        resolve(w.YT);
        return;
      }
      w.onYouTubeIframeAPIReady = () => resolve(w.YT);
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        tag.async = true;
        tag.onerror = () => reject(new Error("YouTube API failed to load"));
        document.head.appendChild(tag);
      }
      window.setTimeout(() => reject(new Error("YouTube API timed out")), 15000);
    });
  }
  return apiPromise;
}

export function useYoutubePlayer() {
  const playerRef = useRef<YTPlayerLike | null>(null);
  const indexRef = useRef(0);
  const shuffleRef = useRef(false);
  const repeatRef = useRef<RepeatMode>("off");
  const timeRef = useRef(0);
  const pollRef = useRef<number | null>(null);

  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");
  const [error, setError] = useState(false);
  const [failed, setFailed] = useState(false);

  const goToIndex = useCallback((i: number) => {
    indexRef.current = i;
    setIndex(i);
  }, []);

  const startPolling = useCallback(() => {
    if (pollRef.current) return;
    pollRef.current = window.setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      try {
        const t = p.getCurrentTime() || 0;
        const d = p.getDuration() || 0;
        timeRef.current = t;
        setCurrentTime(t);
        if (d > 0) setDuration(d);
      } catch {
        /* noop */
      }
    }, 500);
  }, []);

  const handleState = useCallback(
    (state: number) => {
      const p = playerRef.current;
      if (state === 1) {
        setPlaying(true);
        setError(false);
      } else if (state === 2) {
        setPlaying(false);
      } else if (state === 0) {
        setPlaying(false);
        if (repeatRef.current === "one") {
          p?.seekTo(0, true);
          p?.playVideo();
          return;
        }
        const i = indexRef.current;
        if (repeatRef.current === "off" && i === TRACKS.length - 1 && !shuffleRef.current) {
          return; // end of the line
        }
        const next = shuffleRef.current ? randomIndex(i) : (i + 1) % TRACKS.length;
        goToIndex(next);
        p?.loadVideoById(TRACKS[next].videoId);
      }
    },
    [goToIndex]
  );

  useEffect(() => {
    let cancelled = false;
    loadYouTubeAPI().then((YT) => {
      if (cancelled || playerRef.current) return;
      playerRef.current = new YT.Player("rail-gaadi-player", {
        height: "200",
        width: "360",
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
          iv_load_policy: 3,
        },
        events: {
          onReady: () => {
            if (cancelled) return;
            setReady(true);
            playerRef.current?.setVolume(80);
            playerRef.current?.cueVideoById(TRACKS[indexRef.current].videoId);
            startPolling();
          },
          onStateChange: (e: any) => handleState(e.data),
          onError: () => {
            if (!cancelled) setError(true);
          },
        },
      });
    }).catch(() => {
      if (!cancelled) setFailed(true);
    });

    return () => {
      cancelled = true;
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, [handleState, startPolling]);

  const togglePlay = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    if (playing) p.pauseVideo();
    else p.playVideo();
  }, [playing]);

  const skip = useCallback(
    (dir: 1 | -1) => {
      const p = playerRef.current;
      if (!p) return;
      if (dir === -1 && timeRef.current > 3) {
        p.seekTo(0, true);
        setCurrentTime(0);
        timeRef.current = 0;
        return;
      }
      const i = indexRef.current;
      const next = shuffleRef.current ? randomIndex(i) : (i + dir + TRACKS.length) % TRACKS.length;
      goToIndex(next);
      p.loadVideoById(TRACKS[next].videoId);
    },
    [goToIndex]
  );

  const playTrack = useCallback(
    (i: number) => {
      setError(false);
      goToIndex(i);
      const p = playerRef.current;
      if (!p) return;
      p.loadVideoById(TRACKS[i].videoId);
    },
    [goToIndex]
  );

  const seek = useCallback((t: number) => {
    const p = playerRef.current;
    timeRef.current = t;
    setCurrentTime(t);
    p?.seekTo(t, true);
  }, []);

  const setVolumeLevel = useCallback((v: number) => {
    const p = playerRef.current;
    setVolume(v);
    p?.setVolume(v);
    if (v === 0) setMuted(true);
    else if (p && p.isMuted()) {
      p.unMute();
      setMuted(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    if (p.isMuted()) {
      p.unMute();
      setMuted(false);
    } else {
      p.mute();
      setMuted(true);
    }
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle((s) => {
      const v = !s;
      shuffleRef.current = v;
      return v;
    });
  }, []);

  const cycleRepeat = useCallback(() => {
    setRepeat((r) => {
      const v: RepeatMode = r === "off" ? "all" : r === "all" ? "one" : "off";
      repeatRef.current = v;
      return v;
    });
  }, []);

  return {
    ready,
    playing,
    index,
    currentTime,
    duration,
    volume,
    muted,
    shuffle,
    repeat,
    error,
    failed,
    togglePlay,
    skip,
    playTrack,
    seek,
    setVolumeLevel,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
  };
}
