package handlerResultsSession

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"paddle-api/services"
)

type handler struct {
	sessionService *services.SessionService
}

func NewHandlerResultsSession(sessionService *services.SessionService) *handler {
	return &handler{sessionService: sessionService}
}

func (h *handler) ResultsStreamHandler(ctx *gin.Context) {

	userid := ctx.Param("id")

	sessions, e := h.sessionService.GetSessionsByUserID(userid)

	// if no videos or correct userid are provided
	if len(sessions) == 0 {
		ctx.JSON(http.StatusNotFound, gin.H{"message": "No videos available or wrong userid."})
		return
	}

	if e != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "Something went wrong, try again."})
		return
	} else {

		ctx.JSON(http.StatusOK, sessions)
	}
}
