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
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
