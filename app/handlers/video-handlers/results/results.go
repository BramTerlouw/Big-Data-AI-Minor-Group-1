package handlerResultsVideo

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"paddle-api/services"
)

type handler struct {
	videoService *services.VideoService
}

func NewHandlerResultsVideo(videoService *services.VideoService) *handler {
	return &handler{videoService: videoService}
}

func (h *handler) ResultsVideoHandler(ctx *gin.Context) {

	userid := ctx.Param("id")

	videoResults, e := h.videoService.GetVideosByUserID(userid)

	// if no videos or correct userid are provided
	if len(videoResults) == 0 {
		ctx.JSON(http.StatusNotFound, gin.H{"message": "No videos available or wrong userid."})
		return
	}

	if e != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"message": "Something went wrong, try again."})
		return
	} else {

		ctx.JSON(http.StatusOK, videoResults)
	}
}
