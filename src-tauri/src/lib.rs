mod commands;

use crate::commands::tunnel;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![tunnel::setup_tunnel])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
