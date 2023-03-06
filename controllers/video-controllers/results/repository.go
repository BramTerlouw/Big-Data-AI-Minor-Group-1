package resultsVideo

import (
	"database/sql"
	responseDTO "paddle-api/models/responseDTO"
	"time"
)

type Repository interface {
	ResultsVideoRepository(userid int) (*[]responseDTO.EntityVideo, string)
}

type repository struct {
	db *sql.DB
}

func NewRepositoryResults(db *sql.DB) *repository {
	return &repository{db: db}
}

func (r *repository) ResultsVideoRepository(userid int) (*[]responseDTO.EntityVideo, string) {

	var videos []responseDTO.EntityVideo

	rows, err := r.db.Query(videosGet, userid)
	if err != nil {
		return nil, "GET_VIDEOS_FAILED_403"
	}

	defer rows.Close()

	for rows.Next() {
		var video responseDTO.EntityVideo
		var uploadDateStr string // declare string variable to store the upload date
		var outputDatestr string

		if err := rows.Scan(&video.Id, &video.InputFilename, &video.ProcessedFilename, &video.Description, &video.UserId, &video.Status, &uploadDateStr, &outputDatestr, &video.Score); err != nil {
			return nil, "GET_VIDEOS_FAILED_403"
		}

		// parse the upload date string into a time.Time value
		uploadDate, err := time.Parse("2006-01-02 15:04:05", uploadDateStr)
		outputDate, err := time.Parse("2006-01-02 15:04:05", outputDatestr)
		if err != nil {
			return nil, "GET_VIDEOS_FAILED_403"
		}
		video.UploadDate = uploadDate // set the parsed time value
		video.OutputDate = outputDate

		videos = append(videos, video)
	}

	if err := rows.Err(); err != nil {
		return nil, "GET_VIDEOS_FAILED_403"
	}

	return &videos, ""
}

var videosGet = `SELECT videos.id, input_filename, processed_filename, description, user_id, status.status, upload_date, output_date, videos.score 
          FROM videos
          INNER JOIN status ON videos.status_id = status.id
          WHERE videos.user_id = ?`
