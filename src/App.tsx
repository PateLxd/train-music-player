import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/utils/cn";
import { BUMPER_LINES, getPlaylist, type Track } from "@/data/playlist";
import { THEMES, type VendorId } from "@/data/themes";
import { getVendor } from "@/data/vendors";
import { useYoutubePlayer } from "@/hooks/useYoutubePlayer";
import { useThemeRail } from "@/hooks/useThemeRail";
import { useVendorCalls } from "@/hooks/useVendorCalls";
import { playTrainHorn } from "@/utils/horn";
import {
  BellIcon,
  CheckIcon,
  ChevronUpIcon,
  NextIcon,
  PauseIcon,
  PlayIcon,
  PrevIcon,
  RepeatIcon,
  ShuffleIcon,
  VolumeIcon,
  VolumeMuteIcon,
} from "@/components/Icons";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
}

/** extract the `list=` id from a YouTube / YouTube Music playlist URL */
function parsePlaylistId(input: string): string | null {
  const m = input.match(/[?&]list=([A-Za-z0-9_-]{10,})/);
  if (!m) return null;
  const url = input.trim();
  if (!/youtube\.com/i.test(url) && !/^[A-Za-z0-9_-]{10,}$/.test(url)) return null;
  return m[1];
}

function ThemeSwitcher({ themeId, onSelect }: { themeId: string; onSelect: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = THEMES.find((t) => t.id === themeId) ?? THEMES[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="theme-switcher" ref={ref}>
      <button
        type="button"
        className="theme-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="theme-trigger-emoji">{active.emoji}</span>
        <span className="theme-trigger-text">
          <strong>{active.nameHi}</strong>
          <small>{active.region}</small>
        </span>
        <ChevronUpIcon className={cn("h-4 w-4 transition-transform", open ? "rotate-0" : "rotate-180")} />
      </button>

      {open && (
        <div className="theme-menu" role="listbox" aria-label="Choose train theme">
          <p className="theme-menu-head">
            ट्रेन बदलो, रीजन बदलो · <span>Choose your train & region</span>
          </p>
          <div className="theme-menu-grid">
            {THEMES.map((t) => {
              const selected = t.id === themeId;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={cn("theme-option", selected && "selected")}
                  onClick={() => {
                    onSelect(t.id);
                    setOpen(false);
                  }}
                >
                  <span className="theme-option-img">
                    <img src={t.image} alt="" loading="lazy" />
                    <span className="theme-option-emoji">{t.emoji}</span>
                  </span>
                  <span className="theme-option-body">
                    <strong>
                      {t.nameHi} <small>{t.name}</small>
                    </strong>
                    <em>{t.region} · {t.zone}</em>
                    <span className="theme-option-route">{t.route}</span>
                  </span>
                  {selected && (
                    <span className="theme-option-check">
                      <CheckIcon className="h-4 w-4" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function PlaylistPicker({ player, isCustom }: { player: ReturnType<typeof useYoutubePlayer>; isCustom: boolean }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [msg, setMsg] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const submit = () => {
    const listId = parsePlaylistId(url);
    if (!listId) {
      setMsg("Paste a YouTube / YouTube Music playlist URL with ?list=…");
      return;
    }
    const ok = player.loadCustomPlaylist(listId);
    if (ok) {
      setMsg("");
      setUrl("");
      setOpen(false);
    } else {
      setMsg("Player isn't ready yet — wait a second and try again.");
    }
  };

  const clear = () => {
    player.exitCustom();
    setMsg("");
    setUrl("");
    setOpen(false);
  };

  return (
    <div className="playlist-picker" ref={ref}>
      <button
        type="button"
        className={cn("playlist-trigger", isCustom && "active")}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        🎧 <span className="hide-narrow">{isCustom ? "My Playlist" : "My Playlist"}</span>
      </button>

      {open && (
        <div className="playlist-pop" role="dialog" aria-label="Load your own YouTube playlist">
          <p className="playlist-pop-title">
            मेरा प्लेलिस्ट · <span>YouTube Music / YouTube playlist</span>
          </p>
          <input
            className="playlist-input"
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setMsg("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            placeholder="https://music.youtube.com/playlist?list=PL…"
            aria-label="YouTube playlist URL"
          />
          <div className="playlist-actions">
            <button type="button" className="playlist-load" onClick={submit}>
              ▶ Load & Play
            </button>
            {isCustom && (
              <button type="button" className="playlist-clear" onClick={clear}>
                Back to station
              </button>
            )}
          </div>
          <p className="playlist-note">
            {msg || "Only YouTube and YouTube Music playlist links are supported. Theme music pauses until you go back."}
          </p>
        </div>
      )}
    </div>
  );
}

function PlayerBar({ player, tracks }: { player: ReturnType<typeof useYoutubePlayer>; tracks: Track[] }) {
  const isCustom = player.mode === "custom";
  const track = isCustom ? null : tracks[player.index] ?? tracks[0];
  const custom = player.custom;
  const progress = player.duration ? (player.currentTime / player.duration) * 100 : 0;
  const artId = isCustom ? custom?.videoId : track?.videoId ?? custom?.videoId;
  const thumbnail = artId ? `https://i.ytimg.com/vi/${artId}/mqdefault.jpg` : "";
  const displayTitle = isCustom ? custom?.title || "My Playlist" : track?.title ?? "";
  const displayMeta = isCustom
    ? `${custom?.author || "YouTube Music"} · MY PLAYLIST`
    : `${track!.artist} · ${track!.album}`;
  const counter = isCustom
    ? String((custom?.index ?? 0) + 1).padStart(2, "0")
    : `${String(player.index + 1).padStart(2, "0")}/${String(tracks.length).padStart(2, "0")}`;
  if (!isCustom && !track) return null;

  // fallback target that ALWAYS works, even when embedding is blocked
  const watchUrl = isCustom
    ? `https://music.youtube.com/playlist?list=${custom?.listId}&index=${custom?.index ?? 0}`
    : `https://www.youtube.com/watch?v=${track!.videoId}`;

  const statusBlocked = player.signal === "blocked";

  return (
    <div className="player-dock">
      <section className="player-bar" aria-label="Rail Musafir music player">
        <div className="player-grip" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <img className="bar-art" src={thumbnail} alt="" />

        <div className="bar-details">
          <div className="bar-title-row">
            <h2 className="min-w-0 truncate" title={displayTitle}>
              {displayTitle}
              {isCustom && <span className="custom-chip">🎧 MY PLAYLIST</span>}
            </h2>
            <span className="bar-counter">{counter}</span>
          </div>
          <p className="truncate">{displayMeta}</p>

          <div className="bar-progress">
            <span>{formatTime(player.currentTime)}</span>
            <input
              className="player-range"
              type="range"
              min={0}
              max={player.duration || 0}
              step={1}
              value={Math.min(player.currentTime, player.duration || 0)}
              onChange={(e) => player.seek(Number(e.target.value))}
              style={{
                background: `linear-gradient(90deg, var(--accent) 0%, var(--accent) ${progress}%, rgba(255,255,255,.14) ${progress}%)`,
              }}
              aria-label="Seek through current track"
            />
            <span>{formatTime(player.duration)}</span>
          </div>
        </div>

        <div className="bar-controls">
          <button
            type="button"
            onClick={player.toggleShuffle}
            className={cn("bar-btn hide-narrow", player.shuffle && "active")}
            aria-label="Shuffle tracks"
            aria-pressed={player.shuffle}
          >
            <ShuffleIcon className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => player.skip(-1)} className="bar-btn" aria-label="Previous track">
            <PrevIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={player.togglePlay}
            disabled={!player.ready}
            className="bar-play"
            aria-label={player.playing ? "Pause" : "Play"}
          >
            {player.playing ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5 translate-x-px" />}
          </button>
          <button type="button" onClick={() => player.skip(1)} className="bar-btn" aria-label="Next track">
            <NextIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={player.cycleRepeat}
            className={cn("bar-btn hide-narrow", player.repeat !== "off" && "active")}
            aria-label={`Repeat: ${player.repeat}`}
            aria-pressed={player.repeat !== "off"}
            title={`Repeat: ${player.repeat}`}
          >
            <RepeatIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={player.toggleMute}
            className="bar-btn"
            aria-label={player.muted ? "Unmute" : "Mute"}
            aria-pressed={player.muted}
          >
            {player.muted ? <VolumeMuteIcon className="h-4 w-4" /> : <VolumeIcon className="h-4 w-4" />}
          </button>
          <input
            className="volume-range wide-only"
            type="range"
            min={0}
            max={100}
            step={1}
            value={player.volume}
            onChange={(e) => player.setVolumeLevel(Number(e.target.value))}
            style={{
              background: `linear-gradient(90deg, var(--accent) ${player.volume}%, rgba(255,255,255,.14) ${player.volume}%)`,
            }}
            aria-label="Volume"
          />
        </div>

        {statusBlocked && (
          <p className="bar-blocked" role="status">
            🔇 Browser blocked autoplay here — tap the 🔊 button once to unmute & play.
          </p>
        )}
        {player.failed && (
          <p className="bar-error" role="alert">
            ⚠ Station signal unavailable — YouTube API couldn't load. Check your network and refresh.
          </p>
        )}
        {!player.failed && (player.error || (player.signal === "error" && player.lastError)) && (
          <p className="bar-error" role="alert">
            ⚠ {player.lastError?.message ?? "This track is unavailable — trying the next one."}
            {player.lastError && (
              <>
                {" "}
                <a href={watchUrl} target="_blank" rel="noreferrer" className="bar-watch">
                  Watch on YouTube ↗
                </a>
              </>
            )}
          </p>
        )}
      </section>
    </div>
  );
}

export default function App() {
  const { theme, themeId, selectTheme } = useThemeRail();
  const playlist = useMemo(() => getPlaylist(theme.id), [theme.id]);
  const tracks = playlist.tracks;
  const player = useYoutubePlayer(tracks);
  const vendorAudio = useVendorCalls(true);
  const bumper = BUMPER_LINES[player.index % BUMPER_LINES.length];

  const themeVendors = useMemo(() => theme.vendors.map((id) => getVendor(id)), [theme.vendors]);

  const playVendor = vendorAudio.playVendor;

  useEffect(() => {
    const handler = () => {
      if (!themeVendors.length) return;
      const v = themeVendors[Math.floor(Math.random() * themeVendors.length)];
      playVendor(v, true);
    };
    window.addEventListener("rail-ambient-vendor", handler);
    return () => window.removeEventListener("rail-ambient-vendor", handler);
  }, [themeVendors, playVendor]);

  useEffect(() => {
    vendorAudio.stop();
  }, [themeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const onVendor = useCallback((id: VendorId) => {
    const v = getVendor(id);
    vendorAudio.playVendor(v);
  }, [vendorAudio.playVendor]);

  return (
    <div className="site-shell">
      <div className="grain fixed inset-0 pointer-events-none" />

      {/* YouTube player host is created by useYoutubePlayer OUTSIDE the React
          tree (appended to <body>) so re-renders never tear the iframe down. */}

      <header className="topbar">
        <div className="brand-block">
          <span className="brand-mark">🚂</span>
          <span className="brand-name">
            <strong>भारतीय रेल</strong>
            <small>Rail Musafir Radio</small>
          </span>
        </div>

        <ThemeSwitcher themeId={themeId} onSelect={selectTheme} />

        <div className="topbar-right">
          <span
            className={cn("signal-chip", player.signal)}
            title={
              player.signal === "playing"
                ? "Live: music is playing"
                : player.signal === "blocked"
                  ? "Playback started but sound is blocked — tap 🔊"
                  : player.signal === "error"
                    ? `Playback error${player.lastError ? ` (${player.lastError.code})` : ""}`
                    : player.signal === "failed"
                      ? "YouTube API failed to load"
                      : player.signal === "ready"
                        ? "Player ready — press ▶"
                        : "Connecting to YouTube…"
            }
          >
            <i />
            {player.signal === "playing" ? "LIVE" : player.signal === "error" ? "⚠" : player.signal === "blocked" ? "🔇" : player.ready ? "READY" : "…"}
          </span>
          <PlaylistPicker player={player} isCustom={player.mode === "custom"} />
          <div className="listener-count">
            <span className="status-dot" />
            <strong>1,247</strong>
            <span className="hide-narrow">on the rails</span>
          </div>
          <div className="track-count">
            <strong>{player.mode === "custom" ? "♪" : tracks.length}</strong>
            <span className="hide-narrow">{player.mode === "custom" ? "my list" : "station tracks"}</span>
          </div>
        </div>
      </header>

      <main className="hero-composition">
        <section className="identity" aria-labelledby="site-title">
          <p className="route-line">
            {theme.nameHi} <span className="route-sep">•</span> {theme.route}
          </p>
          <h1 id="site-title">भारतीय रेल</h1>
          <div className="subline">
            <span />
            <p>{theme.tagline}</p>
            <span />
          </div>
        </section>

        <section className="station-board" aria-label="Station information">
          <span className="station-board-name">{theme.station}</span>
          <span className="station-board-zone">{theme.zone}</span>
        </section>

        <figure className="train-banner">
          <figcaption className="visually-hidden">
            {theme.name} — {theme.blurb}
          </figcaption>
          {THEMES.map((t) => (
            <img
              key={t.id}
              src={t.image}
              alt={`${t.name} at ${t.station}`}
              className={cn("banner-img", t.id === theme.id && "is-active")}
            />
          ))}
        </figure>

        <section className="bumper-copy" aria-live="polite">
          <p>{bumper.hi}</p>
          <span>{bumper.en}</span>
        </section>

        <section className="vendor-zone" aria-label="Platform vendor calls">
          <div className="vendor-head">
            <p className="vendor-title">
              प्लेटफ़ॉर्म की आवाज़ें <span>· Platform Calls</span>
            </p>
            <div className="vendor-head-actions">
              <button type="button" className="horn-button" onClick={playTrainHorn} title="Train horn">
                🚂 <span className="hide-narrow">Train Horn</span>
              </button>
              <button
                type="button"
                className={cn("vendor-ambient", vendorAudio.ambient && "active")}
                onClick={vendorAudio.toggleAmbient}
                aria-pressed={vendorAudio.ambient}
              >
                <BellIcon className="h-3.5 w-3.5" />
                {vendorAudio.ambient ? "Ambience ON" : "Ambience OFF"}
              </button>
            </div>
          </div>
          <div className="vendor-row">
            {themeVendors.map((v) => {
              const active = vendorAudio.activeVendor?.id === v.id && vendorAudio.speaking;
              return (
                <button
                  key={v.id}
                  type="button"
                  className={cn("vendor-chip", active && "speaking")}
                  onClick={() => onVendor(v.id)}
                  aria-pressed={active}
                  title={v.callEn}
                >
                  <span className="vendor-emoji">{v.emoji}</span>
                  <span className="vendor-call">
                    <strong>{v.nameHi}</strong>
                    <small>{v.name}</small>
                  </span>
                  {active && <span className="vendor-wave" aria-hidden="true"><i /><i /><i /></span>}
                </button>
              );
            })}
          </div>
          <p className="vendor-note" aria-live="polite">
            {vendorAudio.speaking && vendorAudio.activeVendor
              ? `🔔 ${vendorAudio.activeVendor.nameHi} — ${vendorAudio.activeVendor.callEn}`
              : "टैप करो और प्लेटफ़ॉर्म की आवाज़ सुनो · tap a call to hear the platform"}
          </p>
        </section>
      </main>

      <PlayerBar player={player} tracks={tracks} />

      <footer className="page-footer">
        <span>भारतीय रेल · RAIL MUSAFIR FM</span>
        <span>STREAMING VIA YOUTUBE</span>
      </footer>
    </div>
  );
}
