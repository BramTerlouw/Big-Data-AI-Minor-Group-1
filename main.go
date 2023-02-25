package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"os"
	"os/exec"
)

func main() {
	// Initialize the Gin router
	r := gin.Default()

	// Define the route to handle file uploads
	r.POST("/upload", func(c *gin.Context) {
		// Get the file from the request
		file, err := c.FormFile("file")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Save the file to disk
		err = c.SaveUploadedFile(file, "input/"+file.Filename)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Respond with "Video will be processed"
		c.JSON(http.StatusOK, gin.H{"message": "Video will be processed"})

		cmd := exec.Command("python3.9", "python/ProcessVideo.py")

		// Execute the command
		output, err := cmd.Output()
		if err != nil {
			fmt.Println("Error executing command:", err)
			return
		}
		// Print the output
		fmt.Println(string(output))
	})

	// Create the input directory if it does not exist
	if _, err := os.Stat("input"); os.IsNotExist(err) {
		os.Mkdir("input", 0755)
	}
	// Create the output directory if it does not exist
	if _, err := os.Stat("output"); os.IsNotExist(err) {
		os.Mkdir("output", 0755)
	}

	// Start the server
	if err := r.Run(":8080"); err != nil {
		fmt.Println("Error starting server:", err)
	}
}
