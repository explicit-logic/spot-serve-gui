use localtunnel_client::{ open_tunnel, broadcast, ClientConfig };

const TUNNEL_SERVER: &str = "https://localtunnel.me";

#[tauri::command]
pub async fn setup_tunnel(
  local_host: String,
  local_port: u16,
) -> Result<String, String> {
    // Create a broadcast channel for shutdown signals
    let (notify_shutdown, _) = broadcast::channel(1);

    // Validate and construct the configuration
    let config = ClientConfig {
      server: Some(TUNNEL_SERVER.to_string()),
      // subdomain: Some("spot-serve".to_string()),
      subdomain: None,
      local_host: Some(local_host),
      local_port,
      shutdown_signal: notify_shutdown.clone(),
      max_conn: 10,
      credential: None,
    };

    // Open the tunnel asynchronously
    let result = match open_tunnel(config).await {
        Ok(result) => result,
        Err(e) => return Err(format!("Failed to open tunnel: {}", e)),
    };

    // Shutdown the background tasks by sending a signal
    // if let Err(e) = notify_shutdown.send(()) {
    //     return Err(format!("Failed to send shutdown signal: {}", e));
    // }

    Ok(result)
}
