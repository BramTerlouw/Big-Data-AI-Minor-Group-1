package score

import (
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	model "paddle-api/models"
	"paddle-api/services"
)

type handler struct {
	sessionService *services.SessionService
}

func NewHandlerScoreSession(sessionService *services.SessionService) *handler {
	return &handler{sessionService: sessionService}
}

func (h *handler) ScoreSessionHandler(ctx *gin.Context) {
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

	var scoreData []model.ScoreData
	if err := ctx.ShouldBindJSON(&scoreData); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "JSON parse went wrong!"})
		return
	}

	e := h.sessionService.UpdateSession(&model.InputUpdateSession{Id: session.Id, Status: "Processed", Score: scoreData})
	if e != nil {
		log.Println(e)
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "session has started"})
}
