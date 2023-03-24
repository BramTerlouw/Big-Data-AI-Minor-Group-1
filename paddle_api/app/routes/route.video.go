package route

import (
	"github.com/gin-gonic/gin"
	handlerCreateVideo "paddle-api/handlers/video-handlers/create"
	handlerPicture "paddle-api/handlers/video-handlers/picture"
	handlerResultsVideo "paddle-api/handlers/video-handlers/results"
	"paddle-api/repositories"
	"paddle-api/services"
)

func InitVideoRoutes(route *gin.Engine) {

	//Creating repo and service
	videoRepository := repositories.NewCreateRepository()
	videoService := services.NewVideoService(videoRepository)

	//Creating handlers
	createVideoHandler := handlerCreateVideo.NewHandlerCreateVideo(videoService)
	resultsVideoHandler := handlerResultsVideo.NewHandlerResultsVideo(videoService)
	pictureHandler := handlerPicture.NewHandlerPicture(videoService)

	//All video Route.Use(util.Auth()
	groupRoute := route.Group("/api/v1")
	groupRoute.POST("/video/upload", createVideoHandler.CreateVideoHandler)
	groupRoute.POST("/video/picture", pictureHandler.CreatePictureHandler)
	groupRoute.GET("/video/results/:id", resultsVideoHandler.ResultsVideoHandler)
}
