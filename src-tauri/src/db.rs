extern crate rusqlite;

use rusqlite::{Connection, Result, params};

#[derive(Debug)]
pub struct Mind{
  id: i32,
  title: String,
  content: String
}

pub fn connect() -> Result<Connection> {
    let conn = Connection::open("data.db")?;
    conn.execute(
        "CREATE TABLE IF NOT EXISTS minds(
            id INTEGER PRIMARY KEY,
            title TEXT,
            comments TEXT)",
        [],
    )?;
    Ok(conn)
}

pub fn insert(conn: &Connection, title: &str, content: &str) -> Result<()> {
    conn.execute(
        "INSERT INTO minds (title, comments) VALUES (?1, ?2)",
        params![title, content],
    )?;
    Ok(())
}

pub fn delete(conn: &Connection, id: i32) -> Result<()> {
    conn.execute("DELETE FROM minds WHERE id = ?1", params![id])?;
    Ok(())
}

pub fn get_all_minds(conn: &Connection) -> Result<Vec<Mind>> {
    let mut statement = conn.prepare("SELECT id, title, comments FROM minds")?;
    let minds = statement
        .query_map([], |row| {
            Ok(Mind {
                id: row.get(0)?,
                title: row.get(1)?,
                content: row.get(2)?,
            })
        })?
        .map(|i| i.unwrap())
        .collect();
    Ok(minds)
}

pub fn get_mind_by_id(conn: &Connection, id: i32) -> Result<Mind> {
    let mut statement = conn.prepare("SELECT id, title, comments FROM minds WHERE id = ?1")?;
    let mind = statement
        .query_row(params![id], |row| {
            Ok(Mind {
                id: row.get(0)?,
                title: row.get(1)?,
                content: row.get(2)?,
            })
        })?;
    Ok(mind)
}