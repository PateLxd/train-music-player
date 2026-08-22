import { cn } from "@/utils/cn";
import { BUMPER_LINES, TRACKS } from "@/data/playlist";
import { useYoutubePlayer } from "@/hooks/useYoutubePlayer";
import {
  NextIcon,
  PauseIcon,
  PlayIcon,
  PrevIcon,
  ShuffleIcon,
  VolumeIcon,
  VolumeMuteIcon,
} from "@/components/Icons";
import trainScene from "@/assets/train-station-hero.jpg";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
}

export default function App() {
  const player = useYoutubePlayer();
  const track = TRACKS[player.index];
  const bumper = BUMPER_LINES[player.index % BUMPER_LINES.length];
  const progress = player.duration ? (player.currentTime / player.duration) * 100 : 0;
  const thumbnail = `https://i.ytimg.com/vi/${track.videoId}/mqdefault.jpg`;

  return (
    <div className="site-shell">
      <div className="grain fixed inset-0 pointer-events-none" />

      <div
        id="rail-gaadi-player"
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: 1,
          height: 1,
          overflow: "hidden",
          opacity: 0,
          pointerEvents: "none",
          zIndex: -1,
        }}
      />

      <header className="topbar">
        <div className="listener-count">
          <span className="status-dot" />
          <strong>1,247</strong>
          <span>on the rails</span>
        </div>
        <p className="top-route">Indian railway radio</p>
        <div className="track-count">
          <strong>{TRACKS.length}</strong> tracks
        </div>
      </header>

      <main className="hero-composition">
        <section className="identity" aria-labelledby="site-title">
          <p className="route-line">Howrah to Bombay &nbsp;•&nbsp; Non-stop</p>
          <h1 id="site-title">रेल मुसाफ़िर</h1>
          <div className="subline">
            <span />
            <p>गीत जो सफ़र के साथ चलें</p>
            <span />
          </div>
        </section>

        <figure className="train-banner">
          <img
            src={trainScene}
            alt="A blue Indian passenger train waiting at a rural platform at dusk"
          />
        </figure>

        <section className="bumper-copy" aria-live="polite">
          <p>{bumper.hi}</p>
          <span>{bumper.en}</span>
        </section>

        <section className="audio-player" aria-label="Rail Musafir YouTube music player">
          <img className="track-art" src={thumbnail} alt="" />

          <div className="track-details">
            <div className="track-heading">
              <div className="min-w-0">
                <h2>{track.title}</h2>
                <p>{track.artist} · {track.album}</p>
              </div>
              <span>
                {String(player.index + 1).padStart(2, "0")}/{String(TRACKS.length).padStart(2, "0")}
              </span>
            </div>

            <div className="progress-row">
              <span>{formatTime(player.currentTime)}</span>
              <input
                className="player-range"
                type="range"
                min={0}
                max={player.duration || 0}
                step={1}
                value={Math.min(player.currentTime, player.duration || 0)}
                onChange={(event) => player.seek(Number(event.target.value))}
                style={{
                  background: `linear-gradient(90deg, #f2a516 0%, #f2a516 ${progress}%, rgba(255,255,255,.16) ${progress}%)`,
                }}
                aria-label="Seek through current track"
              />
              <span>{formatTime(player.duration)}</span>
            </div>
          </div>

          <div className="player-controls">
            <button
              type="button"
              onClick={player.toggleShuffle}
              className={cn("control-button small", player.shuffle && "active")}
              aria-label="Shuffle tracks"
            >
              <ShuffleIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => player.skip(-1)}
              className="control-button"
              aria-label="Previous track"
            >
              <PrevIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={player.togglePlay}
              disabled={!player.ready}
              className="play-button"
              aria-label={player.playing ? "Pause" : "Play"}
            >
              {player.playing ? (
                <PauseIcon className="h-5 w-5" />
              ) : (
                <PlayIcon className="h-5 w-5 translate-x-px" />
              )}
            </button>
            <button
              type="button"
              onClick={() => player.skip(1)}
              className="control-button"
              aria-label="Next track"
            >
              <NextIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={player.toggleMute}
              className="control-button small"
              aria-label={player.muted ? "Unmute" : "Mute"}
            >
              {player.muted ? (
                <VolumeMuteIcon className="h-4 w-4" />
              ) : (
                <VolumeIcon className="h-4 w-4" />
              )}
            </button>
          </div>
        </section>

        {(player.error || player.failed) && (
          <p className="player-error">
            {player.failed
              ? "Station signal unavailable. Please refresh."
              : "This track is unavailable. Try the next one."}
          </p>
        )}
      </main>

      <footer>
        <span>RAIL MUSAFIR FM</span>
        <span>STREAMING VIA YOUTUBE</span>
      </footer>
    </div>
  );
}