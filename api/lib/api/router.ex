defmodule Api.Router do
  use Plug.Router

  plug(Plug.Static, at: "/", from: :api)
  plug(:match)
  plug(:dispatch)

  get "/hello" do
    send_resp(conn, 200, "world")
  end

  match _ do
    send_resp(conn, 404, "Not Found")
  end
end
