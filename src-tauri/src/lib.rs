mod database;
mod email;

use database::*;
use tauri::AppHandle;

#[cfg(not(target_os = "android"))]
use tauri::Manager;
#[cfg(not(target_os = "android"))]
use std::fs;
#[cfg(not(target_os = "android"))]
use std::path::PathBuf;

// Load environment variables at startup
fn load_env() {
    if let Err(e) = dotenvy::dotenv() {
        eprintln!("Warning: Could not load .env file: {}", e);
    }
}

#[tauri::command]
fn get_products(app: AppHandle) -> Result<Vec<Product>, String> {
    let db_path = database::get_db_path(&app)?;
    database::get_products(&db_path).map_err(|e| e.to_string())
}

#[tauri::command]
fn add_product(app: AppHandle, product: NewProduct) -> Result<Product, String> {
    let db_path = database::get_db_path(&app)?;
    database::add_product(&db_path, product).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_product(app: AppHandle, id: i64) -> Result<(), String> {
    let db_path = database::get_db_path(&app)?;
    database::delete_product(&db_path, id).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_settings(app: AppHandle) -> Result<Settings, String> {
    let db_path = database::get_db_path(&app)?;
    database::get_settings(&db_path).map_err(|e| e.to_string())
}

#[tauri::command]
fn save_settings(app: AppHandle, settings: Settings) -> Result<(), String> {
    let db_path = database::get_db_path(&app)?;
    database::save_settings(&db_path, settings).map_err(|e| e.to_string())
}

#[tauri::command]
fn add_sale(app: AppHandle, sale: Sale) -> Result<i64, String> {
    let db_path = database::get_db_path(&app)?;
    database::add_sale(&db_path, sale).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_transactions(app: AppHandle) -> Result<Vec<Transaction>, String> {
    let db_path = database::get_db_path(&app)?;
    database::get_transactions(&db_path).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_transaction(app: AppHandle, id: i64) -> Result<(), String> {
    let db_path = database::get_db_path(&app)?;
    database::delete_transaction(&db_path, id).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_analytics(app: AppHandle) -> Result<AnalyticsData, String> {
    let db_path = database::get_db_path(&app)?;
    database::get_analytics(&db_path).map_err(|e| e.to_string())
}

#[tauri::command]
fn export_database_cmd(app: AppHandle) -> Result<String, String> {
    let db_path = database::get_db_path(&app)?;
    let data = database::export_database(&db_path).map_err(|e| e.to_string())?;
    use base64::Engine;
    Ok(base64::engine::general_purpose::STANDARD.encode(&data))
}

#[tauri::command]
fn import_database_cmd(app: AppHandle, data: String) -> Result<(), String> {
    let db_path = database::get_db_path(&app)?;
    use base64::Engine;
    let decoded = base64::engine::general_purpose::STANDARD.decode(&data).map_err(|e| e.to_string())?;
    database::import_database(&db_path, decoded).map_err(|e| e.to_string())
}

#[tauri::command]
fn send_support_email(
    name: String,
    email: String,
    subject: String,
    message: String,
) -> Result<(), String> {
    email::send_support_email(name, email, subject, message)
}

// Helper function to get window state file path (desktop only)
#[cfg(not(target_os = "android"))]
fn get_window_state_path(app: &AppHandle) -> Result<PathBuf, String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&app_dir).map_err(|e| e.to_string())?;
    Ok(app_dir.join("window_state.json"))
}

// Helper function to save window state (desktop only)
#[cfg(not(target_os = "android"))]
fn save_window_state(app: &AppHandle, is_maximized: bool) -> Result<(), String> {
    let path = get_window_state_path(app)?;
    let state = serde_json::json!({
        "is_maximized": is_maximized
    });
    fs::write(path, serde_json::to_string_pretty(&state).unwrap())
        .map_err(|e| e.to_string())
}

// Helper function to load window state (desktop only)
#[cfg(not(target_os = "android"))]
fn load_window_state(app: &AppHandle) -> Result<bool, String> {
    let path = get_window_state_path(app)?;
    if path.exists() {
        let content = fs::read_to_string(path).map_err(|e| e.to_string())?;
        let state: serde_json::Value = serde_json::from_str(&content).map_err(|e| e.to_string())?;
        Ok(state.get("is_maximized").and_then(|v| v.as_bool()).unwrap_or(false))
    } else {
        Ok(false)
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Load environment variables
    load_env();
    
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            let db_path = database::get_db_path(&app.handle())?;
            database::initialize_database(&db_path).map_err(|e| e.to_string())?;
            
            // Setup window state management (desktop only)
            #[cfg(not(target_os = "android"))]
            {
                let window = app.get_webview_window("main").unwrap();
                
                // Restore maximize state
                let is_maximized = load_window_state(&app.handle()).unwrap_or(false);
                if is_maximized {
                    let _ = window.maximize();
                }
                
                // Listen for window resize events to save maximize state
                let window_clone = window.clone();
                let app_handle = app.handle().clone();
                window.on_window_event(move |event| {
                    if let tauri::WindowEvent::Resized(_) = event {
                        // Check if window is maximized
                        if let Ok(is_maximized) = window_clone.is_maximized() {
                            let _ = save_window_state(&app_handle, is_maximized);
                        }
                    }
                });
            }
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_products,
            add_product,
            delete_product,
            get_settings,
            save_settings,
            add_sale,
            get_transactions,
            delete_transaction,
            get_analytics,
            export_database_cmd,
            import_database_cmd,
            send_support_email,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
