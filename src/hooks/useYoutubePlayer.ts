import { useCallback, useEffect, useRef, useState } from "react";
import type { Track } from "@/data/playlist";

export type RepeatMode = "off" | "all" | "one";
export type PlayerMode = "station" | "custom";
export type Signal =
  | "booting" // API script loading / player initialising
  | "ready" // player exists, nothing cued yet (or paused)
  | "playing" // actually playing (state 1/3)
  | "blocked" // browser blocked autoplay — started muted, tap unmute
  | "error" // last playback failed (see lastError)
  | "failed"; // API itself could not load

interface YTVideoData {
  video_id?: string;
  title?: string;
  author?: string;
}

interface YTPlayerLike {
  loadVideoById: (id: string) => void;
  cueVideoById: (id: string) => void;
  loadPlaylist: (opts: {
    list: string;
    listType?: "playlist";
    index?: number;
    startSeconds?: number;
    suggestedQuality?: string;
  }) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  nextVideo: () => void;
  previousVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  setVolume: (v: number) => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  getVideoData: () => YTVideoData;
  getPlaylist: () => string;
  getPlaylistIndex: () => number;
  destroy: () => void;
}

function randomIndex(current: number, length: number): number {
  if (length <= 1) return 0;
  let n = current;
  while (n === current) n = Math.floor(Math.random() * length);
  return n;
}

let apiPromise: Promise<any> | null = null;
let apiErrorListenerAttached = false;

function loadYouTubeAPI(): Promise<any> {
  if (!apiPromise) {
    apiPromise = new Promise((resolve, reject) => {
      const w = window as any;
      if (w.YT && w.YT.Player) {
        resolve(w.YT);
        return;
      }
      if (!apiErrorListenerAttached) {
        apiErrorListenerAttached = true;
        window.addEventListener("error", (e) => {
          if (String(e.message).includes("youtube")) reject(new Error("YouTube widget failed"));
        });
      }
      const prevReady = w.onYouTubeIframeAPIReady;
      w.onYouTubeIframeAPIReady = () => {
        prevReady?.();
        resolve(w.YT);
      };
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        tag.async = true;
        tag.onerror = () => reject(new Error("YouTube API failed to load"));
        document.head.appendChild(tag);
      }
      window.setTimeout(() => reject(new Error("YouTube API timed out")), 20000);
    });
  }
  return apiPromise;
}

/** youtube iframe api error codes → readable message */
export function describeError(code: number): string {
  switch (code) {
    case 2:
      return "Invalid video parameter — bad link";
    case 5:
      return "HTML5 player error on this device";
    case 100:
      return "Video not found, private or removed";
    case 101:
    case 150:
      return "Video owner doesn't allow embedding — play it on YouTube instead";
    case 153:
      return "Embedding restricted (music content) — play it on YouTube instead";
    default:
      return `YouTube blocked playback (error ${code})`;
  }
}

export const PLAYER_HOST_ID = "rail-gaadi-player";

/**
 * Host element lives OUTSIDE React (appended to <body>).
 * YouTube's API replaces it with an <iframe>; if React owned this element,
 * its next re-render would try to reconcile a "div" and tear down the live
 * iframe — the classic "starts then dies" bug. React never sees this node.
 */
function ensureHost(): HTMLElement {
  const existing = document.getElementById(PLAYER_HOST_ID) as HTMLElement | null;
  if (existing) return existing;
  const host = document.createElement("div");
  host.id = PLAYER_HOST_ID;
  host.style.cssText =
    "position:fixed;left:0;top:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;z-index:-1";
  document.body.appendChild(host);
  return host;
}

export function useYoutubePlayer(tracks: Track[]) {
  const playerRef = useRef<YTPlayerLike | null>(null);
  const tracksRef = useRef(tracks);
  const modeRef = useRef<PlayerMode>("station");
  const indexRef = useRef(0);
  const shuffleRef = useRef(false);
  const repeatRef = useRef<RepeatMode>("off");
  const playingRef = useRef(false);
  const timeRef = useRef(0);
  const pollRef = useRef<number | null>(null);
  const skipTimerRef = useRef<number | null>(null);
  const consecutiveErrorsRef = useRef(0);
  const loadedVideoRef = useRef<string | null>(null);
  const errorFlagRef = useRef(false);
  const pendingPlayRef = useRef<number | null>(null);
  const mutedRetryRef = useRef(false);
  const stateRef = useRef<number>(-1);

  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [signal, setSignal] = useState<Signal>("booting");
  const [lastError, setLastError] = useState<{ code: number; message: string } | null>(null);
  const [mode, setMode] = useState<PlayerMode>("station");
  const [custom, setCustom] = useState<{
    listId: string;
    title: string;
    author: string;
    videoId: string | null;
    index: number;
  } | null>(null);
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

  const log = useCallback((...args: unknown[]) => {
    // visible in DevTools console — useful when reporting issues
    // eslint-disable-next-line no-console
    console.info("[RailMusafir]", ...args);
  }, []);

  /** watchdog: if a play request isn't confirmed, retry muted (autoplay-block fix) */
  const checkPendingPlay = useCallback(
    (p: YTPlayerLike) => {
      if (pendingPlayRef.current == null) return;
      const waited = Date.now() - pendingPlayRef.current;
      if (waited < 2000) return;
      const st = (() => {
        try {
          return p.getPlayerState();
        } catch {
          return -1;
        }
      })();
      if (st === 1 || st === 3) {
        pendingPlayRef.current = null;
        playingRef.current = true;
        setPlaying(true);
        if (mutedRetryRef.current) {
          mutedRetryRef.current = false;
          try {
            p.unMute();
          } catch {
            /* noop */
          }
          if (!p.isMuted()) {
            setMuted(false);
            setSignal("playing");
          } else {
            setMuted(true);
            setSignal("blocked");
            log("autoplay: started muted, tap unmute");
          }
        } else {
          setSignal("playing");
        }
        return;
      }
      if (!mutedRetryRef.current) {
        log("autoplay blocked, retrying muted");
        mutedRetryRef.current = true;
        pendingPlayRef.current = Date.now();
        try {
          p.mute();
          p.playVideo();
        } catch {
          /* noop */
        }
        return;
      }
      pendingPlayRef.current = null;
      mutedRetryRef.current = false;
      if (stateRef.current !== 1 && stateRef.current !== 3) {
        setPlaying(false);
        setSignal((s) => (s === "blocked" ? s : "error"));
        setLastError((prev) =>
          prev ?? { code: -1, message: "Video did not start — check the console or watch it on YouTube" }
        );
      }
    },
    [log]
  );

  const startPolling = useCallback(() => {
    if (pollRef.current) return;
    pollRef.current = window.setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      try {
        checkPendingPlay(p);
        const t = p.getCurrentTime() || 0;
        const d = p.getDuration() || 0;
        timeRef.current = t;
        setCurrentTime(t);
        if (d > 0) setDuration(d);

        if (modeRef.current === "custom") {
          const data = p.getVideoData?.() ?? {};
          const idx = p.getPlaylistIndex?.() ?? 0;
          setCustom((prev) => {
            const videoId = data.video_id ?? null;
            const title = data.title || prev?.title || "My Playlist";
            const author = data.author || prev?.author || "YouTube Music";
            if (
              prev &&
              prev.title === title &&
              prev.author === author &&
              prev.videoId === videoId &&
              prev.index === idx
            ) {
              return prev;
            }
            return { listId: prev?.listId ?? "", title, author, videoId, index: idx };
          });
        }
      } catch {
        /* noop */
      }
    }, 400);
  }, [checkPendingPlay]);

  const skipAfterError = useCallback(
    () => {
      if (skipTimerRef.current) return;
      skipTimerRef.current = window.setTimeout(() => {
        skipTimerRef.current = null;
        if (!errorFlagRef.current) return;
        if (consecutiveErrorsRef.current >= 8) {
          setError(true);
          return;
        }
        consecutiveErrorsRef.current += 1;
        const p = playerRef.current;
        if (!p) return;
        try {
          if (modeRef.current === "custom") {
            p.nextVideo();
          } else {
            const list = tracksRef.current;
            if (list.length) {
              const next = randomIndex(indexRef.current, list.length);
              goToIndex(next);
              loadedVideoRef.current = list[next].videoId;
              errorFlagRef.current = false;
              p.loadVideoById(list[next].videoId); // loadVideoById auto-plays
              log("skipping restricted video →", list[next].title);
            }
          }
        } catch {
          /* noop */
        }
        setError(true);
      }, 1200);
    },
    [goToIndex, log]
  );

  const handleState = useCallback(
    (state: number) => {
      stateRef.current = state;
      const p = playerRef.current;
      const list = tracksRef.current;
      log("state:", state);
      if (state === 1 || state === 3) {
        playingRef.current = true;
        setPlaying(true);
        setError(false);
        errorFlagRef.current = false;
        consecutiveErrorsRef.current = 0;
        pendingPlayRef.current = null;
        setSignal("playing");
      } else if (state === 2) {
        playingRef.current = false;
        setPlaying(false);
        setSignal((s) => (s === "blocked" ? s : "ready"));
      } else if (state === 5) {
        playingRef.current = false;
        setPlaying(false);
        setSignal((s) => (s === "blocked" ? s : "ready"));
      } else if (state === 0) {
        playingRef.current = false;
        setPlaying(false);
        if (repeatRef.current === "one") {
          p?.seekTo(0, true);
          p?.playVideo();
          return;
        }
        if (modeRef.current === "custom") {
          if (repeatRef.current === "all") p?.nextVideo();
          return;
        }
        const i = indexRef.current;
        if (repeatRef.current === "off" && i === list.length - 1 && !shuffleRef.current) {
          return;
        }
        const next = shuffleRef.current ? randomIndex(i, list.length) : (i + 1) % list.length;
        goToIndex(next);
        p?.loadVideoById(list[next].videoId);
        loadedVideoRef.current = list[next].videoId;
      }
    },
    [goToIndex, log]
  );

  /**
   * STRICTMODE-SAFE SINGLETON INIT
   * React StrictMode (dev) mounts effects: run, cleanup, run.
   * Each run gets its own `disposed` flag; the shared `playerRef` is the
   * only real guard, so the SECOND run is the one that creates the player.
   * (A flag set on the first run would block the second run → no player, no
   * playback — this was the actual bug. Player is never destroyed.)
   */
  useEffect(() => {
    if (playerRef.current) return;
    let disposed = false;

    loadYouTubeAPI()
      .then((YT) => {
        if (disposed || playerRef.current) return;
        log("api loaded");
        const origin =
          window.location.origin && window.location.origin !== "null" ? window.location.origin : undefined;
        try {
          const host = ensureHost();
          const player = new YT.Player(host, {
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
              ...(origin ? { origin } : {}),
            },
            events: {
              onReady: () => {
                if (disposed || !playerRef.current) return;
                log("player ready");
                setReady(true);
                setSignal("ready");
                try {
                  playerRef.current?.setVolume(volume);
                  const current = tracksRef.current[indexRef.current];
                  if (current) {
                    playerRef.current?.cueVideoById(current.videoId);
                    loadedVideoRef.current = current.videoId;
                  }
                } catch {
                  /* noop */
                }
                startPolling();
              },
              onStateChange: (e: any) => handleState(e.data),
              onError: (e: any) => {
                if (disposed || !playerRef.current) return;
                const code = Number(e?.data ?? -1);
                log("error:", code, describeError(code));
                errorFlagRef.current = true;
                setLastError({ code, message: describeError(code) });
                setError(true);
                setSignal("error");
                skipAfterError();
              },
            },
          }) as YTPlayerLike;

          playerRef.current = player;
          const embed = document.getElementById(PLAYER_HOST_ID);
          log("embed created:", embed?.tagName === "IFRAME" ? "iframe ✓" : `element <${embed?.tagName ?? "MISSING"}>`, { origin });
          if (embed?.tagName !== "IFRAME") setFailed(true);
        } catch (err) {
          log("player construction failed:", err);
          setFailed(true);
          setSignal("failed");
        }
      })
      .catch((err) => {
        if (!disposed) {
          log("api failed:", err);
          setFailed(true);
          setSignal("failed");
        }
      });

    return () => {
      disposed = true;
      // NOTE: never destroy the YT player — StrictMode remounts would kill it.
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** re-tune the station when the active playlist changes (keeps custom mode) */
  useEffect(() => {
    tracksRef.current = tracks;
    if (modeRef.current === "custom") return;
    if (!tracks.length) return;
    goToIndex(0);
    timeRef.current = 0;
    setCurrentTime(0);
    setDuration(0);
    loadedVideoRef.current = null;
    const p = playerRef.current;
    if (p && ready) {
      p.cueVideoById(tracks[0].videoId);
      loadedVideoRef.current = tracks[0].videoId;
      if (playingRef.current) p.playVideo();
    }
  }, [tracks, goToIndex, ready]);

  const togglePlay = useCallback(() => {
    const p = playerRef.current;
    if (!p) {
      log("play pressed but player not ready");
      return;
    }
    if (playingRef.current) {
      p.pauseVideo();
      playingRef.current = false;
      setPlaying(false);
      setSignal("ready");
      return;
    }
    if (modeRef.current === "station" && !loadedVideoRef.current) {
      const current = tracksRef.current[indexRef.current];
      if (current) {
        loadedVideoRef.current = current.videoId;
        errorFlagRef.current = false;
        setSignal("ready");
        p.loadVideoById(current.videoId);
        playingRef.current = true;
        setPlaying(true);
        pendingPlayRef.current = Date.now();
        log("play → load+play", current.title);
        return;
      }
    }
    errorFlagRef.current = false;
    setError(false);
    setSignal("ready");
    p.playVideo();
    playingRef.current = true;
    setPlaying(true);
    pendingPlayRef.current = Date.now();
    log("play → playVideo");
  }, [log]);

  const skip = useCallback(
    (dir: 1 | -1) => {
      const p = playerRef.current;
      const list = tracksRef.current;
      if (!p) return;
      if (modeRef.current === "custom") {
        try {
          if (dir > 0) p.nextVideo();
          else p.previousVideo();
          errorFlagRef.current = false;
          setError(false);
        } catch {
          /* noop */
        }
        return;
      }
      if (!list.length) return;
      if (dir === -1 && timeRef.current > 3) {
        p.seekTo(0, true);
        setCurrentTime(0);
        timeRef.current = 0;
        return;
      }
      const i = indexRef.current;
      const next = shuffleRef.current ? randomIndex(i, list.length) : (i + dir + list.length) % list.length;
      goToIndex(next);
      loadedVideoRef.current = list[next].videoId;
      errorFlagRef.current = false;
      setError(false);
      p.loadVideoById(list[next].videoId); // auto-plays
      playingRef.current = true;
      setPlaying(true);
      pendingPlayRef.current = Date.now();
    },
    [goToIndex]
  );

  const playTrack = useCallback(
    (i: number) => {
      const list = tracksRef.current;
      if (modeRef.current === "custom") return;
      if (!list.length) return;
      errorFlagRef.current = false;
      setError(false);
      goToIndex(i);
      const p = playerRef.current;
      if (!p) return;
      loadedVideoRef.current = list[i].videoId;
      p.loadVideoById(list[i].videoId);
      playingRef.current = true;
      setPlaying(true);
      pendingPlayRef.current = Date.now();
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
      setSignal("playing");
    }
  }, []);

  const toggleMute = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    // user gesture → unmute always allowed → un-blocks muted-autoplay fallback
    if (p.isMuted()) {
      p.unMute();
      setMuted(false);
      setSignal("playing");
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

  /** load a YouTube / YouTube Music playlist from its list= id */
  const loadCustomPlaylist = useCallback(
    (listId: string): boolean => {
      const p = playerRef.current;
      if (!p || !ready) return false;
      modeRef.current = "custom";
      setMode("custom");
      errorFlagRef.current = false;
      setError(false);
      setCustom({
        listId,
        title: "My Playlist",
        author: "YouTube Music",
        videoId: null,
        index: 0,
      });
      try {
        p.loadPlaylist({ list: listId, listType: "playlist", index: 0 });
        playingRef.current = true;
        setPlaying(true);
        pendingPlayRef.current = Date.now();
        log("custom playlist loaded:", listId);
        return true;
      } catch {
        return false;
      }
    },
    [ready, log]
  );

  /** back to the theme's station playlist */
  const exitCustom = useCallback(() => {
    modeRef.current = "station";
    setMode("station");
    setCustom(null);
    const p = playerRef.current;
    const list = tracksRef.current;
    if (p && list.length) {
      const current = list[indexRef.current] ?? list[0];
      goToIndex(list.indexOf(current));
      loadedVideoRef.current = current.videoId;
      errorFlagRef.current = false;
      setError(false);
      p.cueVideoById(current.videoId);
      if (playingRef.current) p.playVideo();
    }
  }, [goToIndex]);

  return {
    ready,
    playing,
    signal,
    lastError,
    mode,
    custom,
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
    loadCustomPlaylist,
    exitCustom,
  };
}
