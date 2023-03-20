package route

import (
	"github.com/gin-gonic/gin"
	handlerCreateVideo "paddle-api/handlers/video-handlers/create"
	handlerPicture "paddle-api/handlers/video-handlers/picture"
	handlerResultsVideo "paddle-api/handlers/video-handlers/results"
	handlerStream "paddle-api/handlers/video-handlers/stream"
	"paddle-api/repositories"
	"paddle-api/services"
	util "paddle-api/utils"
)

func InitVideoRoutes(route *gin.Engine) {

	//Creating repo and service
	videoRepository := repositories.NewCreateRepository()
	videoService := services.NewVideoService(videoRepository)

	//Creating handlers
	createVideoHandler := handlerCreateVideo.NewHandlerCreateVideo(videoService)
	resultsVideoHandler := handlerResultsVideo.NewHandlerResultsVideo(videoService)
	streamHandler := handlerStream.NewHandlerStream(videoService)
	pictureHandler := handlerPicture.NewHandlerPicture(videoService)

	//All video Route
	groupRoute := route.Group("/api/v1").Use(util.Auth())
	groupRoute.POST("/video/upload", createVideoHandler.CreateVideoHandler)
	groupRoute.POST("/video/stream/:session", streamHandler.CreateStreamHandler)
	groupRoute.POST("/video/picture", pictureHandler.CreatePictureHandler)
	groupRoute.GET("/video/results/:id", resultsVideoHandler.ResultsVideoHandler)
}
