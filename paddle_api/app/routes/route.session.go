package route

import (
	"github.com/gin-gonic/gin"
	handlerPicture "paddle-api/handlers/picture-handlers/verify"
	handlerSession "paddle-api/handlers/session-handlers/create"
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
	sessionHandler := handlerSession.NewHandlerCreateSession(sessionService)
	socketHandler := handlerSocket.NewHandlerCreateSocket(sessionService)

	//All video Route.Use(util.Auth()
	groupRoute := route.Group("/api/v1")
	groupRoute.GET("/session/ws/:key", socketHandler.CreateSocketHandler)
	groupRoute.POST("/session/start/:key", sessionHandler.CreateSessionHandler)
	groupRoute.POST("/session/verify", pictureHandler.CreatePictureHandler)
}
