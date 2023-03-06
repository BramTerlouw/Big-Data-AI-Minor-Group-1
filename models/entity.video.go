package model

import "time"

type EntityVideo struct {
	Id                int
	InputFilename     string
	ProcessedFilename string
	UserId            int
	Status            int
	Description       string
	UploadDate        time.Time
	OutputDate        time.Time
	Score             string
}
