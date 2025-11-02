mod database;

use database::*;
use tauri::AppHandle;

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            let db_path = database::get_db_path(&app.handle())?;
            database::initialize_database(&db_path).map_err(|e| e.to_string())?;
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
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
