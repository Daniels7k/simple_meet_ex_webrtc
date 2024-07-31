defmodule ApiWeb.RoomChannel do
  use ApiWeb, :channel

  @ets_table_name :offers

  def create_ets_table() do
    case :ets.whereis(@ets_table_name) do
      :undefined ->
        :ets.new(@ets_table_name, [:set, :public, :named_table])
        @ets_table_name

      _ ->
        @ets_table_name
    end
  end

  def get_value(key) do
    :ets.lookup(@ets_table_name, key)
  end

  def put_value(key, value) do
    :ets.insert(@ets_table_name, {key, value})
  end

  @impl true
  def join("room:lobby", payload, socket) do
    create_ets_table()

    if authorized?(payload) do
      {:ok, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  # Channels can be used in a request/response fashion
  # by sending replies to requests from the client
  @impl true
  def handle_in("ping", payload, socket) do
    {:reply, {:ok, payload}, socket}
  end

  # It is also common to receive messages from the client and
  # broadcast to everyone in the current topic (room:lobby).
  @impl true
  def handle_in("shout", %{"type" => "offer", "sdp" => sdp} = payload, socket) do
    put_value(:offer, sdp)

    broadcast(socket, "shout", payload)
    {:noreply, socket}
  end

  @impl true
  def handle_in("shout", %{"type" => "answer", "sdp" => sdp} = payload, socket) do
    broadcast(socket, "shout", payload)
    {:noreply, socket}
  end

  def handle_in(
        "shout",
        %{"type" => "ice_candidate", "candidate" => candidate, "player_id" => player_id} =
          payload,
        socket
      ) do
    broadcast(socket, "shout", payload)
    {:noreply, socket}
  end

  @impl true
  def handle_in("shout", %{"type" => "request_current_offer"} = payload, socket) do
    {_key, offer_sdp} = get_value(:offer) |> hd()

    msg = %{"type" => "offer", "sdp" => offer_sdp}

    broadcast(socket, "shout", msg)
    {:noreply, socket}
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
