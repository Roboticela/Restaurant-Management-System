use rusqlite::{Connection, Result};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Product {
    pub id: i64,
    pub name: String,
    pub price: f64,
    pub unit: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NewProduct {
    pub name: String,
    pub price: f64,
    pub unit: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Settings {
    pub restaurant_name: Option<String>,
    pub address: Option<String>,
    pub phone: Option<String>,
    pub email: Option<String>,
    pub tax_rate: Option<String>,
    pub currency: Option<String>,
    pub opening_time: Option<String>,
    pub closing_time: Option<String>,
    pub receipt_footer: Option<String>,
    pub logo: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SaleItem {
    pub name: String,
    pub price: f64,
    pub quantity: f64,
    pub unit: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Sale {
    pub products: Vec<SaleItem>,
    pub total_amount: f64,
    pub currency: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Transaction {
    pub id: i64,
    pub items: Vec<TransactionItem>,
    pub total_amount: f64,
    pub currency: String,
    pub date: String,
    pub time: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TransactionItem {
    pub name: String,
    pub price: f64,
    pub quantity: f64,
    pub unit: String,
    pub subtotal: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DailyRevenue {
    pub date: String,
    pub revenue: f64,
    pub orders: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TopProduct {
    pub name: String,
    pub sales: i64,
    pub revenue: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProductDistribution {
    pub name: String,
    pub value: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AnalyticsSummary {
    pub total_orders: i64,
    pub total_revenue: f64,
    pub average_order_value: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AnalyticsData {
    pub daily_revenue: Vec<DailyRevenue>,
    pub top_products: Vec<TopProduct>,
    pub product_distribution: Vec<ProductDistribution>,
    pub summary: AnalyticsSummary,
}

pub fn get_db_path(app: &AppHandle) -> Result<PathBuf, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    
    std::fs::create_dir_all(&app_data_dir)
        .map_err(|e| format!("Failed to create app data directory: {}", e))?;
    
    Ok(app_data_dir.join("restaurant.db"))
}

pub fn initialize_database(db_path: &PathBuf) -> Result<()> {
    let conn = Connection::open(db_path)?;
    
    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            restaurant_name TEXT,
            address TEXT,
            phone TEXT,
            email TEXT,
            tax_rate TEXT,
            currency TEXT,
            opening_time TEXT,
            closing_time TEXT,
            receipt_footer TEXT,
            logo TEXT
        );

        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            unit TEXT NOT NULL DEFAULT 'item',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            total_amount REAL NOT NULL,
            currency TEXT NOT NULL,
            date TEXT DEFAULT (date('now')),
            time TEXT DEFAULT (time('now')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS sale_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sale_id INTEGER NOT NULL,
            product_name TEXT NOT NULL,
            price REAL NOT NULL,
            quantity REAL NOT NULL,
            unit TEXT NOT NULL,
            FOREIGN KEY (sale_id) REFERENCES sales (id)
        );

        INSERT OR IGNORE INTO settings (
            id, restaurant_name, currency, receipt_footer
        ) VALUES (
            1, 
            'Restaurant Management System',
            'PKR',
            'Thank you for your business!'
        );
        "
    )?;
    
    Ok(())
}

// Product operations
pub fn get_products(db_path: &PathBuf) -> Result<Vec<Product>> {
    let conn = Connection::open(db_path)?;
    let mut stmt = conn.prepare("SELECT id, name, price, unit FROM products ORDER BY id DESC")?;
    
    let products = stmt.query_map([], |row| {
        Ok(Product {
            id: row.get(0)?,
            name: row.get(1)?,
            price: row.get(2)?,
            unit: row.get(3)?,
        })
    })?
    .collect::<Result<Vec<_>>>()?;
    
    Ok(products)
}

pub fn add_product(db_path: &PathBuf, product: NewProduct) -> Result<Product> {
    let conn = Connection::open(db_path)?;
    conn.execute(
        "INSERT INTO products (name, price, unit) VALUES (?1, ?2, ?3)",
        (&product.name, &product.price, &product.unit),
    )?;
    
    let id = conn.last_insert_rowid();
    Ok(Product {
        id,
        name: product.name,
        price: product.price,
        unit: product.unit,
    })
}

pub fn delete_product(db_path: &PathBuf, id: i64) -> Result<()> {
    let conn = Connection::open(db_path)?;
    conn.execute("DELETE FROM products WHERE id = ?1", [id])?;
    Ok(())
}

// Settings operations
pub fn get_settings(db_path: &PathBuf) -> Result<Settings> {
    let conn = Connection::open(db_path)?;
    let mut stmt = conn.prepare(
        "SELECT restaurant_name, address, phone, email, tax_rate, currency, 
         opening_time, closing_time, receipt_footer, logo FROM settings WHERE id = 1"
    )?;
    
    let settings = stmt.query_row([], |row| {
        Ok(Settings {
            restaurant_name: row.get(0)?,
            address: row.get(1)?,
            phone: row.get(2)?,
            email: row.get(3)?,
            tax_rate: row.get(4)?,
            currency: row.get(5)?,
            opening_time: row.get(6)?,
            closing_time: row.get(7)?,
            receipt_footer: row.get(8)?,
            logo: row.get(9)?,
        })
    })?;
    
    Ok(settings)
}

pub fn save_settings(db_path: &PathBuf, settings: Settings) -> Result<()> {
    let conn = Connection::open(db_path)?;
    conn.execute(
        "INSERT OR REPLACE INTO settings (
            id, restaurant_name, address, phone, email, tax_rate, 
            currency, opening_time, closing_time, receipt_footer, logo
        ) VALUES (1, ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        (
            &settings.restaurant_name,
            &settings.address,
            &settings.phone,
            &settings.email,
            &settings.tax_rate,
            &settings.currency,
            &settings.opening_time,
            &settings.closing_time,
            &settings.receipt_footer,
            &settings.logo,
        ),
    )?;
    Ok(())
}

// Sales operations
pub fn add_sale(db_path: &PathBuf, sale: Sale) -> Result<i64> {
    let conn = Connection::open(db_path)?;
    
    conn.execute(
        "INSERT INTO sales (total_amount, currency) VALUES (?1, ?2)",
        (&sale.total_amount, &sale.currency),
    )?;
    
    let sale_id = conn.last_insert_rowid();
    
    for item in sale.products {
        conn.execute(
            "INSERT INTO sale_items (sale_id, product_name, price, quantity, unit) 
             VALUES (?1, ?2, ?3, ?4, ?5)",
            (sale_id, &item.name, &item.price, &item.quantity, &item.unit),
        )?;
    }
    
    Ok(sale_id)
}

// Transaction operations
pub fn get_transactions(db_path: &PathBuf) -> Result<Vec<Transaction>> {
    let conn = Connection::open(db_path)?;
    
    let mut stmt = conn.prepare(
        "SELECT id, total_amount, currency, date, time FROM sales ORDER BY id DESC"
    )?;
    
    let sales: Vec<(i64, f64, String, String, String)> = stmt
        .query_map([], |row| {
            Ok((
                row.get(0)?,
                row.get(1)?,
                row.get(2)?,
                row.get(3)?,
                row.get(4)?,
            ))
        })?
        .collect::<Result<Vec<_>>>()?;
    
    let mut transactions = Vec::new();
    
    for (id, total_amount, currency, date, time) in sales {
        let mut item_stmt = conn.prepare(
            "SELECT product_name, price, quantity, unit FROM sale_items WHERE sale_id = ?1"
        )?;
        
        let items: Vec<TransactionItem> = item_stmt
            .query_map([id], |row| {
                let price: f64 = row.get(1)?;
                let quantity: f64 = row.get(2)?;
                Ok(TransactionItem {
                    name: row.get(0)?,
                    price,
                    quantity,
                    unit: row.get(3)?,
                    subtotal: price * quantity,
                })
            })?
            .collect::<Result<Vec<_>>>()?;
        
        transactions.push(Transaction {
            id,
            items,
            total_amount,
            currency,
            date,
            time,
        });
    }
    
    Ok(transactions)
}

pub fn delete_transaction(db_path: &PathBuf, id: i64) -> Result<()> {
    let conn = Connection::open(db_path)?;
    conn.execute("DELETE FROM sale_items WHERE sale_id = ?1", [id])?;
    conn.execute("DELETE FROM sales WHERE id = ?1", [id])?;
    Ok(())
}

// Analytics operations
pub fn get_analytics(db_path: &PathBuf) -> Result<AnalyticsData> {
    let conn = Connection::open(db_path)?;
    
    // Get daily revenue (last 30 days, oldest first for proper chart display)
    let mut daily_stmt = conn.prepare(
        "SELECT date, COALESCE(SUM(total_amount), 0.0) as revenue, COUNT(*) as orders 
         FROM sales 
         GROUP BY date 
         ORDER BY date ASC 
         LIMIT 30"
    )?;
    
    let mut daily_revenue: Vec<DailyRevenue> = daily_stmt
        .query_map([], |row| {
            Ok(DailyRevenue {
                date: row.get(0)?,
                revenue: row.get(1)?,
                orders: row.get(2)?,
            })
        })?
        .collect::<Result<Vec<_>>>()?;
    
    // Reverse to get most recent dates last
    daily_revenue.reverse();
    
    // Get top products
    let mut top_stmt = conn.prepare(
        "SELECT product_name, 
                CAST(SUM(quantity) AS INTEGER) as total_sales, 
                COALESCE(SUM(price * quantity), 0.0) as revenue 
         FROM sale_items 
         GROUP BY product_name 
         ORDER BY total_sales DESC 
         LIMIT 10"
    )?;
    
    let top_products: Vec<TopProduct> = top_stmt
        .query_map([], |row| {
            Ok(TopProduct {
                name: row.get(0)?,
                sales: row.get(1)?,
                revenue: row.get(2)?,
            })
        })?
        .collect::<Result<Vec<_>>>()?;
    
    // Get product distribution
    let mut dist_stmt = conn.prepare(
        "SELECT product_name, CAST(SUM(quantity) AS INTEGER) as total 
         FROM sale_items 
         GROUP BY product_name 
         ORDER BY total DESC 
         LIMIT 5"
    )?;
    
    let product_distribution: Vec<ProductDistribution> = dist_stmt
        .query_map([], |row| {
            Ok(ProductDistribution {
                name: row.get(0)?,
                value: row.get(1)?,
            })
        })?
        .collect::<Result<Vec<_>>>()?;
    
    // Get summary
    let mut summary_stmt = conn.prepare(
        "SELECT COUNT(*) as total_orders, 
                COALESCE(SUM(total_amount), 0.0) as total_revenue 
         FROM sales"
    )?;
    
    let (total_orders, total_revenue): (i64, f64) = summary_stmt.query_row([], |row| {
        Ok((row.get(0)?, row.get(1)?))
    })?;
    
    let average_order_value = if total_orders > 0 {
        total_revenue / total_orders as f64
    } else {
        0.0
    };
    
    Ok(AnalyticsData {
        daily_revenue,
        top_products,
        product_distribution,
        summary: AnalyticsSummary {
            total_orders,
            total_revenue,
            average_order_value,
        },
    })
}

// Database import/export
pub fn export_database(db_path: &PathBuf) -> Result<Vec<u8>> {
    std::fs::read(db_path)
        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))
}

pub fn import_database(db_path: &PathBuf, data: Vec<u8>) -> Result<()> {
    // Backup existing database
    if db_path.exists() {
        let backup_path = db_path.with_extension("db.backup");
        std::fs::copy(db_path, backup_path)
            .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?;
    }
    
    // Write new database
    std::fs::write(db_path, data)
        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?;
    
    Ok(())
}

