use tauri::{async_runtime, Manager, RunEvent};

mod commands;

use crate::commands::tunnel;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(tunnel::TunnelProcess::new())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            tunnel::start_tunnel,
            tunnel::stop_tunnel,
            tunnel::restart_tunnel,
            tunnel::get_tunnel_status,
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app_handle, e| match e {
            RunEvent::ExitRequested { .. } => {
                let handle = app_handle.clone();
                async_runtime::spawn(async move {
                    // Execute the stop_tunnel logic
                    let state = handle.state::<tunnel::TunnelProcess>();
                    if let Err(e) = tunnel::stop_tunnel_internal(&state).await {
                        eprintln!("Failed to stop tunnel: {}", e);
                    }
                });
            }
            RunEvent::Exit { .. } => {
                println!("😔 bye bye");
            }
            _ => {}
        });
}
