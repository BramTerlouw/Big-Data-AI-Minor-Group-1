package handlerStream

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"io"
	"net/http"
	"os/exec"
	"paddle-api/services"
)

type handler struct {
	videoService *services.VideoService
}

func NewHandlerStream(videoService *services.VideoService) *handler {
	return &handler{videoService: videoService}
}

func (h *handler) CreateStreamHandler(ctx *gin.Context) {
	// Set response headers
	ctx.Header("Content-Type", "video/mp4")
	ctx.Header("Transfer-Encoding", "chunked")

	// get the session id
	sessionID := ctx.Param("session")
	fmt.Println(sessionID)

	// Use FFmpeg to generate video stream
	cmd := exec.Command("ffmpeg", "-i", "path/to/video.mp4", "-f", "mp4", "-")

	// Get stdout pipe to read video data
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		ctx.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	// Start FFmpeg command
	err = cmd.Start()
	if err != nil {
		ctx.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	// Create a new Python process
	pythonCmd := exec.Command("python", "path/to/python_script.py")

	// Get stdin pipe to write video data to Python process
	stdin, err := pythonCmd.StdinPipe()
	if err != nil {
		ctx.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	// Start Python command
	err = pythonCmd.Start()
	if err != nil {
		ctx.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	// Write video data to Python process
	_, err = io.Copy(stdin, stdout)
	if err != nil {
		ctx.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	// Wait for both commands to finish
	err = cmd.Wait()
	if err != nil {
		ctx.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	err = pythonCmd.Wait()
	if err != nil {
		ctx.AbortWithError(http.StatusInternalServerError, err)
		return
	}
}
