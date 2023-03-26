package create

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"paddle-api/services"
)

type handler struct {
	sessionService *services.SessionService
}

func NewHandlerCreateSession(sessionService *services.SessionService) *handler {
	return &handler{sessionService: sessionService}
}

func (h *handler) CreateSessionHandler(ctx *gin.Context) {
	sessionKey := ctx.Param("key")

	if sessionKey == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Please provide session key!"})
	}

	session, getSessionError := h.sessionService.GetSessionsBySessionKey(sessionKey)
	if getSessionError != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "An error occurred while getting the session"})
		return
	}

	if session.SessionKey == nil || *session.SessionKeyUsed == true {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Incorrect or already used session key!"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "session has started"})
}
