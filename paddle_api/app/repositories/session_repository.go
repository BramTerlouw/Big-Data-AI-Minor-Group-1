package repositories

import (
	"context"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"paddle-api/database"
	model "paddle-api/models"
	"time"
)

type SessionRepository struct {
	collection *mongo.Collection
}

func NewSessionRepository() *SessionRepository {
	client := database.GetMongoClient()
	collection := client.Database("paddle_app").Collection("sessions")

	return &SessionRepository{
		collection: collection,
	}
}

func (r *SessionRepository) InsertSession(session *model.EntitySession) (*model.EntitySession, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result, err := r.collection.InsertOne(ctx, session)
	if err != nil {
		return nil, err
	}

	insertedID := result.InsertedID.(primitive.ObjectID)

	filter := bson.M{"_id": insertedID}
	var insertedSession *model.EntitySession
	err = r.collection.FindOne(ctx, filter).Decode(&insertedSession)
	if err != nil {
		return nil, err
	}

	return insertedSession, nil
}

func (r *SessionRepository) GetSessionsByUserID(userId string) ([]*model.EntityVideo, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{"userId": userId}
	cur, err := r.collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	videos := make([]*model.EntityVideo, 0)

	for cur.Next(ctx) {
		var video model.EntityVideo
		err := cur.Decode(&video)
		if err != nil {
			return nil, err
		}
		videos = append(videos, &video)
	}

	if err := cur.Err(); err != nil {
		return nil, err
	}

	return videos, nil
}

func (r *SessionRepository) GetSessionsBySessionKey(sessionKey string) (*model.EntitySession, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{"session_key": sessionKey}
	cur, err := r.collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var session model.EntitySession

	for cur.Next(ctx) {
		err := cur.Decode(&session)
		if err != nil {
			return nil, err
		}
	}

	if err := cur.Err(); err != nil {
		return nil, err
	}

	return &session, nil
}

func (r *VideoRepository) UpdateSession(video *model.EntityVideo) error {

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{"_id": video.Id}

	updateFields := bson.M{}

	if video.ProcessedFilename != nil && *video.ProcessedFilename != "" {
		updateFields["processed_filename"] = video.ProcessedFilename
	}

	if video.Status != nil && *video.Status != "" {
		updateFields["status"] = video.Status
	}

	if video.OutputDate != nil {
		updateFields["outputDate"] = video.OutputDate
	}
	if video.Score != nil && len(*video.Score) != 0 {
		updateFields["score"] = video.Score
	}

	update := bson.M{"$set": updateFields}
	_, err := r.collection.UpdateOne(ctx, filter, update)

	return err
}
