package handlerResultsVideo

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	resultsVideo "paddle-api/controllers/video-controllers/results"
	"strconv"
)

type handler struct {
	service resultsVideo.Service
}

func NewHandlerResultsVideo(service resultsVideo.Service) *handler {
	return &handler{service: service}
}

func (h *handler) ResultsVideoHandler(ctx *gin.Context) {

	userid, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, "Invalid userid. Please enter a valid userid")
		return
	}
	fmt.Println(userid)
	videoResults, errResultsVideo := h.service.ResultsVideoService(userid)

	if errResultsVideo == "n" {
		ctx.JSON(http.StatusBadRequest, gin.H{"Something went wrong, try again.": errResultsVideo})
		return
	}

	ctx.JSON(http.StatusOK, videoResults)
}
