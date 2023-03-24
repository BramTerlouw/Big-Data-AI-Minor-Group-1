package responseDTO

import "time"

type EntityVideo struct {
	Id                string    `bson:"_id"`
	InputFilename     string    `bson:"input_filename"`
	ProcessedFilename string    `bson:"processed_filename"`
	UserId            string    `bson:"user_id"`
	Status            string    `bson:"status"`
	Description       string    `bson:"description"`
	UploadDate        time.Time `bson:"uploadDate"`
	OutputDate        time.Time `bson:"outputDate"`
	Score             string    `bson:"score"`
}
