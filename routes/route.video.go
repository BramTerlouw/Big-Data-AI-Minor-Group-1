package route

import (
	"database/sql"
	"github.com/gin-gonic/gin"
	createVideo "paddle-api/controllers/video-controllers/create"
	resultsVideo "paddle-api/controllers/video-controllers/results"
	updateVideo "paddle-api/controllers/video-controllers/update"
	handlerCreateVideo "paddle-api/handlers/video-handlers/create"
	handlerResultsVideo "paddle-api/handlers/video-handlers/results"
	util "paddle-api/utils"
)

func InitVideoRoutes(db *sql.DB, route *gin.Engine) {

	createVideoRepository := createVideo.NewRepositoryCreate(db)
	createVideoService := createVideo.NewServiceCreate(createVideoRepository)
	updateVideoRepository := updateVideo.NewRepositoryUpdate(db)
	updateVideoService := updateVideo.NewServiceCreate(updateVideoRepository)
	createVideoHandler := handlerCreateVideo.NewHandlerCreateVideo(createVideoService, updateVideoService)

	resultsVideoRepository := resultsVideo.NewRepositoryResults(db)
	resultsVideoService := resultsVideo.NewServiceResults(resultsVideoRepository)
	resultsVideoHandler := handlerResultsVideo.NewHandlerResultsVideo(resultsVideoService)

	//All video Route
	groupRoute := route.Group("/api/v1").Use(util.Auth())
	groupRoute.POST("/video/upload", createVideoHandler.CreateVideoHandler)
	groupRoute.GET("/video/results/:id", resultsVideoHandler.ResultsVideoHandler)
}
