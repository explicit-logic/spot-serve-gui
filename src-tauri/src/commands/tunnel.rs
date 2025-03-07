use std::sync::Arc;
use tauri::{async_runtime, AppHandle, Emitter, State};
use tauri_plugin_shell::{
    process::{CommandChild, CommandEvent},
    ShellExt,
};
use tokio::sync::{mpsc, Mutex};

pub struct TunnelProcess {
    process: Arc<Mutex<Option<CommandChild>>>,
    url: Arc<Mutex<Option<String>>>,
    current_port: Arc<Mutex<Option<u16>>>,
}

impl TunnelProcess {
    pub fn new() -> Self {
        Self {
            process: Arc::new(Mutex::new(None)),
            url: Arc::new(Mutex::new(None)),
            current_port: Arc::new(Mutex::new(None)),
        }
    }

    async fn reset_state(&self) {
        {
            let mut url_guard = self.url.lock().await;
            *url_guard = None;
        }
        {
            let mut port_guard = self.current_port.lock().await;
            *port_guard = None;
        }
    }

    // Helper method to get current port
    async fn get_current_port(&self) -> Option<u16> {
        let port_guard = self.current_port.lock().await;
        *port_guard
    }
}

#[tauri::command]
pub async fn restart_tunnel(
    app: AppHandle,
    state: State<'_, TunnelProcess>,
) -> Result<String, String> {
    // Get the current port before stopping
    let current_port = state.get_current_port().await;

    // If no port is set, we can't restart
    let port = current_port.ok_or("No port configured for restart".to_string())?;

    // Stop the tunnel
    stop_tunnel(state.clone()).await?;

    // Start the tunnel with the same port
    start_tunnel(app, state, port).await
}

#[tauri::command]
pub async fn stop_tunnel(state: State<'_, TunnelProcess>) -> Result<(), String> {
    stop_tunnel_internal(&state).await
}

pub async fn stop_tunnel_internal(state: &TunnelProcess) -> Result<(), String> {
    let process = state.process.clone();
    let mut process_guard = process.lock().await;

    if let Some(child) = process_guard.take() {
        child.kill().map_err(|e| format!("Failed to stop tunnel: {}", e))?;
        // Drop the process guard before resetting state
        drop(process_guard);
        state.reset_state().await;
        Ok(())
    } else {
        Ok(()) // Process was not running
    }
}

#[tauri::command]
pub async fn start_tunnel(
    app: AppHandle,
    state: State<'_, TunnelProcess>,
    port: u16,
) -> Result<String, String> {
    // First, check if we need to restart due to port change
    let current_port = {
        let port_guard = state.current_port.lock().await;
        *port_guard
    };

    if let Some(current) = current_port {
        if current != port {
            if let Err(e) = stop_tunnel_internal(&state).await {
                eprintln!("Failed to stop tunnel: {}", e);
            }
        }
    }

    let process = state.process.clone();
    let mut process_guard = process.lock().await;

    // Check the current URL and port after potential reset
    let existing_url = {
        let url_guard = state.url.lock().await;
        url_guard.clone()
    };

    // If process is already running with same port, return existing URL
    if let Some(url) = existing_url {
        if Some(port) == current_port {
            return Ok(url);
        }
    }

    // Update the current port
    {
        let mut port_guard = state.current_port.lock().await;
        *port_guard = Some(port);
    }

    if process_guard.is_some() {
        return Err("Tunnel is already running".into());
    }

    let (mut rx_cmd, child) = match app.shell().sidecar("cloudflared") {
        Ok(cmd) => match cmd
            .args(&["tunnel", "--url", &format!("http://127.0.0.1:{}", port)])
            .spawn()
        {
            Ok(spawned) => spawned,
            Err(e) => return Err(format!("Failed to spawn sidecar: {}", e)),
        },
        Err(e) => {
            return Err(format!(
                "Failed to create `cloudflared` binary command: {}",
                e
            ))
        }
    };

    *process_guard = Some(child);
    drop(process_guard);

    let (tx, mut rx) = mpsc::channel(1);
    let app_handle = app.clone();
    let url_clone = state.url.clone();

    async_runtime::spawn(async move {
        while let Some(event) = rx_cmd.recv().await {
            match event {
                CommandEvent::Stdout(line) => {
                    let log_line = String::from_utf8_lossy(&line).into_owned();
                    println!("{}", log_line);
                    let _ = app_handle.emit("tunnel_out", log_line);
                }
                CommandEvent::Stderr(line) => {
                    let log_line = String::from_utf8_lossy(&line).into_owned();
                    println!("{}", log_line);
                    let _ = app_handle.emit("tunnel_err", log_line.clone());

                    if let Some(url_start) = log_line.find("https://") {
                        let url_end = log_line[url_start..]
                            .find(' ')
                            .unwrap_or(log_line.len() - url_start);
                        let url = &log_line[url_start..url_start + url_end];
                        if url.contains("trycloudflare.com") {
                            let mut url_guard = url_clone.lock().await;
                            *url_guard = Some(url.to_string());
                            let _ = app_handle.emit("tunnel_started", url);
                            let _ = tx.send(url.to_string()).await;
                            break;
                        }
                    }
                }
                CommandEvent::Terminated(status) => {
                    let _ = app_handle.emit("tunnel_terminated", status);
                }
                _ => {}
            }
        }
    });

    let url = rx
        .recv()
        .await
        .ok_or("Failed to get tunnel URL".to_string())?;
    Ok(url)
}

#[tauri::command]
pub async fn get_tunnel_status(state: State<'_, TunnelProcess>) -> Result<TunnelStatus, String> {
    let process_guard = state.process.lock().await;
    let url_guard = state.url.lock().await;
    let port_guard = state.current_port.lock().await;

    Ok(TunnelStatus {
        is_running: process_guard.is_some(),
        current_url: url_guard.clone(),
        current_port: *port_guard,
    })
}

#[derive(serde::Serialize)]
pub struct TunnelStatus {
    is_running: bool,
    current_url: Option<String>,
    current_port: Option<u16>,
}
