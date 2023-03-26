package route

import (
	"github.com/gin-gonic/gin"
	handlerPicture "paddle-api/handlers/picture-handlers/verify"
	handlerSession "paddle-api/handlers/session-handlers/create"
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

	//All video Route.Use(util.Auth()
	groupRoute := route.Group("/api/v1")
	groupRoute.POST("/session/:key", sessionHandler.CreateSessionHandler)
	groupRoute.POST("/session/verify", pictureHandler.CreatePictureHandler)
}
