package createVideo

import (
	"database/sql"
	model "paddle-api/models"
)

type Repository interface {
	CreateVideoRepository(input *model.EntityVideo) (int, string)
}

type repository struct {
	db *sql.DB
}

func NewRepositoryCreate(db *sql.DB) *repository {
	return &repository{db: db}
}

func (r *repository) CreateVideoRepository(input *model.EntityVideo) (int, string) {

	errorCode := make(chan string, 1)

	upload_date := input.UploadDate.Format("2006-01-02 15:04:05")

	stmt, err := r.db.Prepare(videoInsert)
	if err != nil {
		errorCode <- "CREATE_VIDEO_FAILED_403"
	}
	defer stmt.Close()

	result, err := stmt.Exec(
		&input.InputFilename,
		&input.Description,
		&input.UserId,
		&input.Status,
		&upload_date,
	)
	if err != nil {
		panic(err)
	}

	videoId, err := result.LastInsertId()
	if err != nil {
		errorCode <- "CREATE_VIDEO_CONFLICT_409"
	} else {
		errorCode <- "nil"
	}

	return int(videoId), <-errorCode
}

var videoInsert = `
INSERT INTO
    videos(
        input_filename,
    	description,
        user_id,
        status_id,
        upload_date
    )
VALUES(?, ?, ?, ?, ?)
`
