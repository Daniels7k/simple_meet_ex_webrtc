defmodule Api.PeerHandler do
  require Logger

  @behaviour WebSock

  @impl true
  def init(_) do
    {:ok, %{}}
  end

  @impl true
  def handle_in({msg, [opcode: :text]}, state) do
    Logger.info("Received message: #{inspect(msg)}")

    {:push, {:text, msg}, state}
  end

  @impl true
  def handle_info(msg, state) do
    Logger.info("Received info: #{inspect(msg)}")

    {:push, {:text, msg}, state}
  end

  @impl true
  def terminate(reason, _state) do
    Logger.warning("WebSocket connection was terminated, reason: #{inspect(reason)}")
  end
end
