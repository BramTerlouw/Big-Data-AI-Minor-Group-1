package services

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
	model "paddle-api/models"
	repos "paddle-api/repositories"
)

type VideoService struct {
	repository *repos.VideoRepository
}

func NewVideoService(repository *repos.VideoRepository) *VideoService {
	return &VideoService{repository: repository}
}

func (s *VideoService) CreateVideo(input *model.InputCreateVideo) (error, primitive.ObjectID) {
	video := model.EntityVideo{
		InputFilename: &input.InputFilename,
		UserId:        &input.UserId,
		Status:        &input.Status,
		Description:   &input.Description,
		UploadDate:    &input.UploadDate,
	}

	return s.repository.InsertVideo(&video)
}

func (s *VideoService) UpdateVideo(input *model.InputUpdateVideo) error {

	video := model.EntityVideo{
		OutputDate:        input.OutputDate,
		ProcessedFilename: &input.ProcessedFilename,
		Status:            &input.Status,
		Score:             &input.Score,
		Id:                input.Id,
	}

	return s.repository.UpdateVideo(&video)
}

func (s *VideoService) GetVideosByUserID(userId string) ([]*model.EntityVideo, error) {
	return s.repository.GetVideosByUserID(userId)
}
