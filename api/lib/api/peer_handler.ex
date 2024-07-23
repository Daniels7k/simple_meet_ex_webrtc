defmodule Api.PeerHandler do
  require Logger

  alias ElixirSense.Log

  alias ExWebRTC.{
    RTPCodecParameters,
    MediaStreamTrack,
    PeerConnection
  }

  @behaviour WebSock

  @ice_servers [
    %{urls: "stun:stun.l.google.com:19302"}
  ]

  @video_codecs [
    %RTPCodecParameters{
      payload_type: 96,
      mime_type: "video/VP8",
      clock_rate: 90_000
    }
  ]

  @audio_codecs [
    %RTPCodecParameters{
      payload_type: 111,
      mime_type: "audio/opus",
      clock_rate: 48_000,
      channels: 2
    }
  ]

  @impl true
  def init(_) do
    {:ok, pc} =
      PeerConnection.start_link(
        ice_servers: @ice_servers,
        video_codecs: @video_codecs,
        audio_codecs: @audio_codecs
      )

    stream_id = MediaStreamTrack.generate_stream_id()
    video_track = MediaStreamTrack.new(:video, [stream_id])
    audio_track = MediaStreamTrack.new(:audio, [stream_id])

    {:ok, _sender} = PeerConnection.add_track(pc, video_track)
    {:ok, _sender} = PeerConnection.add_track(pc, audio_track)

    state = %{
      peer_connection: pc,
      out_video_track_id: video_track.id,
      out_audio_track_id: audio_track.id,
      in_video_track_id: nil,
      in_audio_track_id: nil
    }

    {:ok, state}
  end

  @impl true
  def handle_in({msg, [opcode: :text]}, state) do
    Logger.info("Received message: #{inspect(msg)}")

    {:push, {:text, msg}, state}
  end

  @impl true
  def handle_info(msg, state) do
    Logger.info("Received info: #{inspect(msg)}")

    handle_webrtc_info(msg, state)
  end

  @impl true
  def terminate(reason, _state) do
    Logger.warning("WebSocket connection was terminated, reason: #{inspect(reason)}")
  end

  defp handle_webrtc_info(_msg, state) do
    IO.inspect(state)
    {:ok, state}
  end
end
