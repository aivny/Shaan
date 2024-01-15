// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn insert(title: &str, content: &str) {
    let conn = db::connect().unwrap();
    let _ = db::insert(&conn, title, content);
}

#[tauri::command]
fn get_all_minds() -> Vec<db::Mind> {
    let conn = db::connect().unwrap();
    db::get_all_minds(&conn).unwrap()
}

#[tauri::command]
fn delete(id: i32) {
    let conn = db::connect().unwrap();
    let _ = db::delete(&conn, id);
}

#[tauri::command]
fn get_mind_by_id(id: i32) -> db::Mind {
    let conn = db::connect().unwrap();
    db::get_mind_by_id(&conn, id).unwrap()
}

fn main() {
    let context = tauri::generate_context!();
    tauri::Builder::default()
        .system_tray(tauri::SystemTray::default())
        .invoke_handler(tauri::generate_handler![greet, insert, get_all_minds, delete, get_mind_by_id])
        .run(context)
        .expect("error while running tauri application");


}
