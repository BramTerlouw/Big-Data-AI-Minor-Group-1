package createVideo

import (
	"paddle-api/models"
	"time"
)

type Service interface {
	CreateVideoService(input *InputCreateVideo) (int, string)
}

type service struct {
	repository Repository
}

func NewServiceCreate(repository Repository) *service {
	return &service{repository: repository}
}

func (s *service) CreateVideoService(input *InputCreateVideo) (int, string) {

	video := model.EntityVideo{
		InputFilename: input.InputFilename,
		UserId:        input.UserId,
		Description:   input.Description,
		UploadDate:    time.Now(),
		Status:        1,
	}

	videoId, errCreateVideo := s.repository.CreateVideoRepository(&video)

	return videoId, errCreateVideo
}
