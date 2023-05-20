package route

import (
	"github.com/gin-gonic/gin"
	handlerPicture "paddle-api/handlers/picture-handlers/verify"
	handlerCreateSession "paddle-api/handlers/session-handlers/create"
	handlerResultsSession "paddle-api/handlers/session-handlers/results"
	handlerSocket "paddle-api/handlers/socket-handlers/create"
	"paddle-api/repositories"
	"paddle-api/services"
)

func InitSessionRoutes(route *gin.Engine) {

	//Creating repo and service
	sessionRepository := repositories.NewSessionRepository()
	sessionService := services.NewSessionService(sessionRepository)

	//Creating handlers
	pictureHandler := handlerPicture.NewHandlerPicture(sessionService)
	sessionCreateHandler := handlerCreateSession.NewHandlerCreateSession(sessionService)
	sessionResultsHandler := handlerResultsSession.NewHandlerResultsSession(sessionService)
	socketHandler := handlerSocket.NewHandlerCreateSocket(sessionService)

	//All video Route.Use(util.Auth()
	groupRoute := route.Group("/api/v1")
	groupRoute.GET("/session/ws/:key", socketHandler.CreateSocketHandler)
	groupRoute.GET("/session/results/:id", sessionResultsHandler.ResultsStreamHandler)
	groupRoute.POST("/session/start/:key", sessionCreateHandler.CreateSessionHandler)
	groupRoute.POST("/session/verify", pictureHandler.CreatePictureHandler)
}
