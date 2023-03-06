package responseDTO

import "time"

type EntityVideo struct {
	Id                int
	InputFilename     string
	ProcessedFilename string
	UserId            int
	Status            string
	Description       string
	UploadDate        time.Time
	OutputDate        time.Time
	Score             string
}
