package updateVideo

import (
	"paddle-api/models"
)

type Service interface {
	UpdateVideoService(input *InputUpdateVideo) bool
}

type service struct {
	repository Repository
}

func NewServiceCreate(repository Repository) *service {
	return &service{repository: repository}
}

func (s *service) UpdateVideoService(input *InputUpdateVideo) bool {

	video := model.EntityVideo{
		OutputDate:        input.OutputDate,
		ProcessedFilename: input.ProcessedFilename,
		Status:            input.Status,
		Score:             input.Score,
		Id:                input.VideoId,
	}

	errorAppeared := s.repository.UpdateVideoRepository(&video)

	return errorAppeared
}
