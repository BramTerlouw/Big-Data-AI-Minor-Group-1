package services

import (
	model "paddle-api/models"
	repos "paddle-api/repositories"
)

type SessionService struct {
	repository *repos.SessionRepository
}

func NewSessionService(repository *repos.SessionRepository) *SessionService {
	return &SessionService{repository: repository}
}

func (s *SessionService) CreateSession(input *model.InputCreateSession) (*model.EntitySession, error) {
	session := model.EntitySession{
		SessionKey:      &input.SessionKey,
		SessionKeyUsed:  &input.SessionKeyUsed,
		PictureFilename: &input.PictureFilename,
		Room:            &input.Room,
		Status:          &input.Status,
		UserId:          &input.UserId,
		CreatedAt:       &input.CreatedAt,
	}

	return s.repository.InsertSession(&session)
}

func (s *SessionService) UpdateSession(input *model.InputUpdateSession) error {

	session := model.EntitySession{
		OutputDate:     input.OutputDate,
		SessionKeyUsed: &input.SessionKeyUsed,
		Status:         &input.Status,
		Score:          &input.Score,
		Id:             input.Id,
	}

	return s.repository.UpdateSession(&session)
}

func (s *VideoService) GetSessionsByUserID(userId string) ([]*model.EntityVideo, error) {
	return s.repository.GetVideosByUserID(userId)
}

func (s *SessionService) GetSessionsBySessionKey(sessionKey string) (*model.EntitySession, error) {
	return s.repository.GetSessionsBySessionKey(sessionKey)
}
