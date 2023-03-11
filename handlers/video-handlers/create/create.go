package handlerCreateVideo

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"os"
	"os/exec"
	createVideo "paddle-api/controllers/video-controllers/create"
	updateVideo "paddle-api/controllers/video-controllers/update"
	"strconv"
	"time"
)

type handler struct {
	serviceCreate createVideo.Service
	serviceUpdate updateVideo.Service
}

func NewHandlerCreateVideo(serviceCreate createVideo.Service, serviceUpdate updateVideo.Service) *handler {
	return &handler{serviceCreate: serviceCreate, serviceUpdate: serviceUpdate}
}

func (h *handler) CreateVideoHandler(ctx *gin.Context) {
	videoId := 0

	//check if file is set
	file, err := ctx.FormFile("file")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	orginalFilename := file.Filename
	filename := generateUniqueFilename(orginalFilename)

	struserid := ctx.PostForm("user_id")
	description := ctx.PostForm("description")
	strfps := ctx.PostForm("fps")

	userid, err := strconv.Atoi(struserid)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"Enter a valid userid": err.Error()})
		return
	}

	// Save the file to disk
	err = ctx.SaveUploadedFile(file, "input/"+filename)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if _, err := os.Stat("processedVideos/" + ctx.PostForm("user_id")); os.IsNotExist(err) {
		os.Mkdir("processedVideos/"+struserid, 0755)
	}

	go func() {

		//cmd := exec.Command("python", "python/ProcessVideo.py", "-u", struserid, "-v", filename, "-f", strfps)
		cmdArgs := []string{"python", "python/ProcessVideo.py", "-u", struserid, "-v", filename}
		if strfps != "" {
			cmdArgs = append(cmdArgs, "-f", strfps)
		}
		cmd := exec.Command(cmdArgs[0], cmdArgs[1:]...)

		// Execute the command
		output, err := cmd.Output()
		if err != nil {
			fmt.Println("Error executing ProcessVideo script:", err)
			// create her a failed sql inject
			h.serviceUpdate.UpdateVideoService(&updateVideo.InputUpdateVideo{VideoId: videoId, Score: "", Status: 3, OutputDate: time.Time{}})

			e := os.Remove("input/" + filename)
			if e != nil {
				log.Fatal(e)
			}

			return
		}
		// Print the output of terminal
		fmt.Println(string(output))

		e := os.Remove("input/" + filename)
		if e != nil {
			log.Fatal(e)
		}

		// everything went good
		h.serviceUpdate.UpdateVideoService(&updateVideo.InputUpdateVideo{ProcessedFilename: filename, VideoId: videoId, Score: "very good score", Status: 2, OutputDate: time.Now()})
	}()

	videoId, errCreateVideo := h.serviceCreate.CreateVideoService(&createVideo.InputCreateVideo{InputFilename: orginalFilename, UserId: userid, Description: description})

	if errCreateVideo != "nil" {
		ctx.JSON(http.StatusBadRequest, gin.H{"Something went wrong, try again.": errCreateVideo})
	} else {
		// Respond with "Video will be processed"
		ctx.JSON(http.StatusOK, gin.H{"message": "Video will be processed"})
	}
}

func generateUniqueFilename(filename string) string {
	timestamp := time.Now().UnixNano()
	return fmt.Sprintf("%d_%s", timestamp, filename)
}
