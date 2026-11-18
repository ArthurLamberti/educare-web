"use client";

import "@livekit/components-styles";

import {
  DisconnectButton,
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  TrackToggle,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * The call of a lesson's virtual room, inside Educare. Connects with the server URL and this user's token
 * from the API; leaving the call goes back to `leaveHref`.
 */
export function LessonRoom({ serverUrl, token, leaveHref }: { serverUrl: string; token: string; leaveHref: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
          {error}
        </p>
      )}
      <LiveKitRoom
        serverUrl={serverUrl}
        token={token}
        connect
        audio
        video
        data-lk-theme="default"
        onDisconnected={() => router.push(leaveHref)}
        onError={() => setError("Não foi possível conectar à sala. Recarregue a página para tentar de novo.")}
        onMediaDeviceFailure={() =>
          setError("Não foi possível usar a câmera ou o microfone. Verifique as permissões do navegador.")
        }
        className="flex h-[calc(100dvh-14rem)] min-h-[28rem] flex-col overflow-hidden rounded-md border border-ink-200 dark:border-ink-800"
      >
        <Stage />
        <RoomAudioRenderer />
        <Controls />
      </LiveKitRoom>
    </div>
  );
}

/** Everyone's camera, plus any shared screen. */
function Stage() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );
  return (
    <GridLayout tracks={tracks} className="min-h-0 flex-1">
      <ParticipantTile />
    </GridLayout>
  );
}

function Controls() {
  return (
    <div className="lk-control-bar flex flex-wrap justify-center gap-2 p-3">
      <TrackToggle source={Track.Source.Microphone}>Microfone</TrackToggle>
      <TrackToggle source={Track.Source.Camera}>Câmera</TrackToggle>
      <TrackToggle source={Track.Source.ScreenShare}>Compartilhar tela</TrackToggle>
      <DisconnectButton>Sair da sala</DisconnectButton>
    </div>
  );
}
