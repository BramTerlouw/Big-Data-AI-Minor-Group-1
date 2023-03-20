package handlerCreateVideo

import (
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"os"
	"os/exec"
	model "paddle-api/models"
	"paddle-api/services"
	"time"
)

type handler struct {
	videoService *services.VideoService
}

func NewHandlerCreateVideo(videoService *services.VideoService) *handler {
	return &handler{videoService: videoService}
}

func (h *handler) CreateVideoHandler(ctx *gin.Context) {

	//check if file is set
	file, err := ctx.FormFile("file")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// generating unique filename
	originalFilename := file.Filename
	filename := generateUniqueFilename(originalFilename)

	// getting post values
	userid := ctx.PostForm("user_id")
	description := ctx.PostForm("description")
	strfps := ctx.PostForm("fps")

	// Save the file to disk
	err = ctx.SaveUploadedFile(file, "input/videos/"+filename)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if _, err := os.Stat("processedVideos/" + ctx.PostForm("user_id")); os.IsNotExist(err) {
		os.Mkdir("processedVideos/"+userid, 0755)
	}

	errCreateVideo, videoId := h.videoService.CreateVideo(&model.InputCreateVideo{InputFilename: originalFilename, UserId: userid, UploadDate: time.Now(), Description: description, Status: "Processing"})

	if errCreateVideo != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"Something went wrong, try again.": errCreateVideo})
		return
	} else {
		// Respond with "Video will be processed"
		ctx.JSON(http.StatusOK, gin.H{"message": "Video will be processed"})
	}

	go func() {

		cmdArgs := []string{"python3.9", "python/VideoInput.py", "-u", userid, "-f", filename}
		if strfps != "" {
			cmdArgs = append(cmdArgs, "--fps", strfps)
		}
		cmd := exec.Command(cmdArgs[0], cmdArgs[1:]...)

		// Execute the command
		output, err := cmd.Output()
		if err != nil {
			fmt.Println("Error executing ProcessVideo script:", err)
			// create her a failed sql inject
			e := h.videoService.UpdateVideo(&model.InputUpdateVideo{Id: videoId, Status: "Failed"})

			if e != nil {
				log.Fatal(e)
			}

			e = os.Remove("input/" + filename)
			if e != nil {
				log.Fatal(e)
			}

			return
		}

		// Getting score from script output and convert json to array
		scoreData := []model.ScoreData{}
		errorJson := json.Unmarshal([]byte(string(output)), &scoreData)
		if errorJson != nil {
			fmt.Println(err)
			return
		}

		e := os.Remove("input/" + filename)
		if e != nil {
			log.Fatal(e)
		}

		// everything went good
		currentTime := time.Now()
		e = h.videoService.UpdateVideo(&model.InputUpdateVideo{ProcessedFilename: filename, Id: videoId, Score: scoreData, Status: "Processed", OutputDate: &currentTime})
		if e != nil {
			log.Fatal(e)
		}
	}()
}

func generateUniqueFilename(filename string) string {
	timestamp := time.Now().UnixNano()
	return fmt.Sprintf("%d_%s", timestamp, filename)
}
