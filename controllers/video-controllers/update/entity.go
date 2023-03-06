package updateVideo

import "time"

type InputUpdateVideo struct {
	VideoId           int
	Status            int
	ProcessedFilename string
	OutputDate        time.Time
	Score             string
}
