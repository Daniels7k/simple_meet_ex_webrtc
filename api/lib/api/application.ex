defmodule Api.Application do
  use Application

  @ip Application.compile_env!(:api, :ip)
  @port Application.compile_env!(:api, :port)

  alias Api.Router

  @impl true
  def start(_type, _args) do
    children = [
      {Bandit, plug: Router, ip: @ip, port: @port}
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Api.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
