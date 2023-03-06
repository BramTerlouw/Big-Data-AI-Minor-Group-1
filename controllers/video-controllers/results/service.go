package resultsVideo

import (
	"paddle-api/models/responseDTO"
)

type Service interface {
	ResultsVideoService(userid int) (*[]responseDTO.EntityVideo, string)
}

type service struct {
	repository Repository
}

func NewServiceResults(repository Repository) *service {
	return &service{repository: repository}
}

func (s *service) ResultsVideoService(userid int) (*[]responseDTO.EntityVideo, string) {
	videoResults, errCreateVideo := s.repository.ResultsVideoRepository(userid)

	return videoResults, errCreateVideo
}
