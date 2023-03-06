package database

import (
	"database/sql"
	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"log"
	"paddle-api/utils"
)

func Connection() *sql.DB {
	return db
}

func init() {
	Config()
	MustConnectDB()
	InitDB()
}

var db *sql.DB

func MustConnectDB() {
	if err := ConnectDatabase(); err != nil {
		panic(err)
	}
}

var (
	username string
	password string
	host     string
	port     string
	database string
)

func Config() {

	username = util.GodotEnv("MYSQL_USERNAME")
	password = util.GodotEnv("MYSQL_PASSWORD")

	host = util.GodotEnv("MYSQL_PORT_3306_TCP_ADDR")
	if host == "" {
		host = "localhost"
	}

	port = util.GodotEnv("MYSQL_PORT_3306_TCP_PORT")
	if port == "" {
		port = "3306"
	}

	database = util.GodotEnv("MYSQL_INSTANCE_NAME")
}

func ConnectDatabase() (err error) {
	uri := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s", username, password, host, port, database)

	if db, err = sql.Open("mysql", uri); err != nil {
		return
	}

	err = db.Ping()
	return
}

func CloseDB() error {
	return db.Close()
}

func InitDB() {
	defer func() {
		if e := recover(); e != nil {
			log.Println(e)
		}
	}()

	CreateTable(createStatusTable)
	CreateTable(createVideoTable)
	if CheckIfFilled() {
		InsertStatus("Processing")
		InsertStatus("Processed")
		InsertStatus("Failed")
	}
}

func InsertStatus(status string) {

	stmt, err := db.Prepare(statusInsert)
	if err != nil {
		panic(err)
	}
	defer stmt.Close()

	_, err = stmt.Exec(
		&status,
	)
	if err != nil {
		panic(err)
	}
}

func CheckIfFilled() bool {

	var count int
	empty := false

	err := db.QueryRow(checkTable).Scan(&count)
	if err != nil {
		panic(err.Error())
	}

	if count == 0 {
		empty = true
	}

	return empty
}

func CreateTable(table string) {
	stmt, err := db.Prepare(table)
	if err != nil {
		panic(err)
	}
	defer stmt.Close()

	_, err = stmt.Exec()
	if err != nil {
		panic(err)
	}
}

var createStatusTable = `
CREATE TABLE IF NOT EXISTS status (
  id INT AUTO_INCREMENT PRIMARY KEY,
  status VARCHAR(15)
);
`

var createVideoTable = `
CREATE TABLE IF NOT EXISTS videos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  input_filename VARCHAR(250),
  processed_filename VARCHAR(250),
  description VARCHAR(250),
  user_id INT,
  status_id INT,
  upload_date DATETIME,
  output_date DATETIME,
  score VARCHAR(250),
  FOREIGN KEY (status_id) REFERENCES status(id)
);`

var statusInsert = `
INSERT INTO
    status(
        status
    )
VALUES(?)
`

var checkTable = `SELECT COUNT(*) FROM status`
