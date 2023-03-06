package updateVideo

import (
	"database/sql"
	model "paddle-api/models"
)

type Repository interface {
	UpdateVideoRepository(input *model.EntityVideo) bool
}

type repository struct {
	db *sql.DB
}

func NewRepositoryUpdate(db *sql.DB) *repository {
	return &repository{db: db}
}

func (r *repository) UpdateVideoRepository(input *model.EntityVideo) bool {

	var processedFilename *string
	errorAppeared := false

	output_date := input.OutputDate.Format("2006-01-02 15:04:05")

	if input.ProcessedFilename == "" {
		processedFilename = nil
	} else {
		processedFilename = &input.ProcessedFilename
	}

	stmt, err := r.db.Prepare(videoUpdate)
	if err != nil {
		panic(err)
	}
	defer stmt.Close()

	_, err = stmt.Exec(
		processedFilename,
		&input.Status,
		&output_date,
		&input.Score,
		&input.Id,
	)
	if err != nil {
		panic(err)
	}

	return errorAppeared
}

var videoUpdate = `UPDATE videos SET
    processed_filename = ?,
    status_id = ?,
    output_date = ?,
    score = ?
WHERE id = ?;
`
