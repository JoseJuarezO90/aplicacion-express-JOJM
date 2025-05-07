//Importamos las librerías requeridas
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

// Documentación en https://expressjs.com/en/starter/hello-world.html
const app = express();

// Middleware para parsear JSON
app.use(bodyParser.json());

// Abrir o crear la base de datos de SQLite
const db = new sqlite3.Database('./base.sqlite3', (err) => {
  if (err) {
    return console.error('Error al abrir BD:', err.message);
  }
  console.log('Conectado a la base de datos SQLite.');

  // Crear tabla 'todos' si no existe
  db.run(
    `CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      todo TEXT NOT NULL,
      created_at INTEGER
    )`,
    (err) => {
      if (err) console.error('Error al crear tabla todos:', err.message);
      else console.log('Tabla todos creada o ya existente.');
    }
  );
});

/**
 * POST /agrega_todo
 * Recibe JSON: { todo: "texto de la tarea" }
 * Inserta en SQLite con timestamp y devuelve JSON con id, todo y created_at
 */
app.post('/agrega_todo', (req, res) => {
  const { todo } = req.body;
  if (!todo) {
    return res.status(400).json({ error: 'El campo "todo" es requerido.' });
  }

  const timestamp = Math.floor(Date.now() / 1000); // Unix timestamp en segundos
  const sql = `INSERT INTO todos (todo, created_at) VALUES (?, ?)`;

  db.run(sql, [todo, timestamp], function (err) {
    if (err) {
      console.error('Error al insertar todo:', err.message);
      return res.status(500).json({ error: 'Error interno al guardar.' });
    }

    // this.lastID contiene el ID de la fila insertada
    res.status(201).json({
      id: this.lastID,
      todo,
      created_at: timestamp
    });
  });
});

/**
 * GET /todos
 * Devuelve la lista completa de todos los registros en formato JSON
 */
app.get('/todos', (req, res) => {
  const sql = 'SELECT * FROM todos';
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Error al leer todos:', err.message);
      return res.status(500).json({ error: 'Error al obtener la lista de todos.' });
    }
    res.status(200).json(rows);
  });
});

/**
 * GET /
 * Endpoint de prueba
 */
app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

// Puerto de la aplicación
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Aplicación corriendo en http://localhost:${PORT}`);
});
