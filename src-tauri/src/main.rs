// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tauri::SystemTray;
use rusqlite::{params, Connection, Result};

#[derive(Debug)]
struct Mind {
    id: i64,
    title: String,
    comments: String,
}

fn create_db() -> Result<Connection>{
    let database_file = "store.db";
    let conn = Connection::open(database_file)?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS mind (
            id INTEGER PRIMARY KEY,
            title TEXT,
            comments TEXT)",
            [],
    )?;

    Ok(conn)
}


// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main(){

    let _ = create_db();

    let context = tauri::generate_context!();
    tauri::Builder::default()
        .system_tray(tauri::SystemTray::default()) // ✅ 将 `tauri.conf.json` 上配置的图标添加到系统托盘
        .run(context)
        .expect("error while running OhMyBox application");

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    

    let mind1 = Mind {
        id: 1,
        title: String::from("title1"),
        comments: String::from("comments1"),
    };

}
