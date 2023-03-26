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

type VideoRepository struct {
	collection *mongo.Collection
}

func NewVideoRepository() *VideoRepository {
	client := database.GetMongoClient()
	collection := client.Database("paddle_app").Collection("videos")

	return &VideoRepository{
		collection: collection,
	}
}

func (r *VideoRepository) InsertVideo(video *model.EntityVideo) (error, primitive.ObjectID) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result, err := r.collection.InsertOne(ctx, video)
	if err != nil {
		panic(err)
	}

	insertedID := result.InsertedID.(primitive.ObjectID)

	return err, insertedID
}

func (r *VideoRepository) GetVideosByUserID(userId string) ([]*model.EntityVideo, error) {
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

func (r *VideoRepository) UpdateVideo(video *model.EntityVideo) error {

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
