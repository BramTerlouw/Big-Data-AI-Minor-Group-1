package route

import (
	"github.com/gin-gonic/gin"
	handlerCreateVideo "paddle-api/handlers/video-handlers/create"
	handlerResultsVideo "paddle-api/handlers/video-handlers/results"
	"paddle-api/repositories"
	"paddle-api/services"
)

func InitVideoRoutes(route *gin.Engine) {

	//Creating repo and service
	videoRepository := repositories.NewVideoRepository()
	videoService := services.NewVideoService(videoRepository)

	//Creating handlers
	createVideoHandler := handlerCreateVideo.NewHandlerCreateVideo(videoService)
	resultsVideoHandler := handlerResultsVideo.NewHandlerResultsVideo(videoService)

	//All video Route.Use(util.Auth()
	groupRoute := route.Group("/api/v1")
	groupRoute.POST("/video/upload", createVideoHandler.CreateVideoHandler)
	groupRoute.GET("/video/results/:id", resultsVideoHandler.ResultsVideoHandler)
}
