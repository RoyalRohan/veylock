use rusqlite::{params, Connection};
use std::path::Path;

pub fn init_db(db_path: &Path) -> Result<Connection, String> {
    if let Some(parent) = db_path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| format!("Failed to create DB directory: {}", e))?;
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            let _ = std::fs::set_permissions(parent, std::fs::Permissions::from_mode(0o700));
        }
    }

    let conn = Connection::open(db_path).map_err(|e| format!("Failed to open SQLite DB: {}", e))?;

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        if db_path.exists() {
            let _ = std::fs::set_permissions(db_path, std::fs::Permissions::from_mode(0o600));
        }
    }

    conn.execute_batch(
        "
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;
        PRAGMA synchronous = NORMAL;

        CREATE TABLE IF NOT EXISTS vault_metadata (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS entries (
            id TEXT PRIMARY KEY,
            category TEXT NOT NULL DEFAULT 'logins',
            is_favorite INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            last_used_at TEXT,
            nonce_b64 TEXT NOT NULL,
            encrypted_payload_b64 TEXT NOT NULL
        );
        ",
    )
    .map_err(|e| format!("Failed to initialize DB schema: {}", e))?;

    Ok(conn)
}

pub fn save_metadata(conn: &Connection, key: &str, value: &str) -> Result<(), String> {
    conn.execute(
        "INSERT OR REPLACE INTO vault_metadata (key, value) VALUES (?1, ?2)",
        params![key, value],
    )
    .map_err(|e| format!("Failed to save metadata key '{}': {}", key, e))?;
    Ok(())
}

pub fn get_metadata(conn: &Connection, key: &str) -> Result<Option<String>, String> {
    let mut stmt = conn
        .prepare("SELECT value FROM vault_metadata WHERE key = ?1")
        .map_err(|e| format!("Failed to prepare metadata query: {}", e))?;

    let mut rows = stmt
        .query(params![key])
        .map_err(|e| format!("Failed to query metadata: {}", e))?;

    if let Some(row) = rows.next().map_err(|e| format!("Error fetching row: {}", e))? {
        let val: String = row.get(0).map_err(|e| format!("Error getting column: {}", e))?;
        Ok(Some(val))
    } else {
        Ok(None)
    }
}

pub fn save_encrypted_entry(
    conn: &Connection,
    id: &str,
    category: &str,
    favorite: bool,
    created_at: &str,
    updated_at: &str,
    last_used_at: Option<&str>,
    nonce_b64: &str,
    encrypted_payload_b64: &str,
) -> Result<(), String> {
    conn.execute(
        "INSERT OR REPLACE INTO entries 
        (id, category, is_favorite, created_at, updated_at, last_used_at, nonce_b64, encrypted_payload_b64) 
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![
            id,
            category,
            if favorite { 1 } else { 0 },
            created_at,
            updated_at,
            last_used_at,
            nonce_b64,
            encrypted_payload_b64
        ],
    )
    .map_err(|e| format!("Failed to save encrypted entry record: {}", e))?;
    Ok(())
}

pub struct RawDbEntryRecord {
    pub id: String,
    pub category: String,
    pub is_favorite: bool,
    pub created_at: String,
    pub updated_at: String,
    pub last_used_at: Option<String>,
    pub nonce_b64: String,
    pub encrypted_payload_b64: String,
}

pub fn get_all_encrypted_entries(conn: &Connection) -> Result<Vec<RawDbEntryRecord>, String> {
    let mut stmt = conn
        .prepare("SELECT id, category, is_favorite, created_at, updated_at, last_used_at, nonce_b64, encrypted_payload_b64 FROM entries")
        .map_err(|e| format!("Failed to prepare entries query: {}", e))?;

    let rows = stmt
        .query_map([], |row| {
            let fav_int: i32 = row.get(2)?;
            Ok(RawDbEntryRecord {
                id: row.get(0)?,
                category: row.get(1)?,
                is_favorite: fav_int != 0,
                created_at: row.get(3)?,
                updated_at: row.get(4)?,
                last_used_at: row.get(5)?,
                nonce_b64: row.get(6)?,
                encrypted_payload_b64: row.get(7)?,
            })
        })
        .map_err(|e| format!("Error executing entries query: {}", e))?;

    let mut records = Vec::new();
    for r in rows {
        records.push(r.map_err(|e| format!("Error mapping entry row: {}", e))?);
    }
    Ok(records)
}

pub fn delete_entry_record(conn: &Connection, id: &str) -> Result<(), String> {
    conn.execute("DELETE FROM entries WHERE id = ?1", params![id])
        .map_err(|e| format!("Failed to delete entry: {}", e))?;
    Ok(())
}

pub fn wipe_all_entries(conn: &Connection) -> Result<(), String> {
    conn.execute("DELETE FROM entries", [])
        .map_err(|e| format!("Failed to wipe entries table: {}", e))?;
    Ok(())
}
