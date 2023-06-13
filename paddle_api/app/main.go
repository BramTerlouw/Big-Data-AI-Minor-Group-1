package main

import (
	"fmt"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"log"
	"os"
	route "paddle-api/routes"
	util "paddle-api/utils"
)

func main() {
	router := SetupRouter()

	// Start the server
	if err := router.Run(":" + util.GodotEnv("GO_PORT")); err != nil {
		fmt.Println("Error starting server:", err)
	}
	log.Fatal(router.Run(":" + util.GodotEnv("GO_PORT")))
}

func SetupRouter() *gin.Engine {

	//Setup Mode Application
	if util.GodotEnv("GO_ENV") != "production" && util.GodotEnv("GO_ENV") != "test" {
		gin.SetMode(gin.DebugMode)
	} else if util.GodotEnv("GO_ENV") == "test" {
		gin.SetMode(gin.TestMode)
	} else {
		gin.SetMode(gin.ReleaseMode)
	}

	//Init router
	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders: []string{"Origin", "Content-Type", "Authorization"},
	}))

	// Create the input directory if it does not exist
	if _, err := os.Stat("input"); os.IsNotExist(err) {
		os.Mkdir("input", 0755)
	}

	// Create the videos directory if it does not exist
	if _, err := os.Stat("input/videos"); os.IsNotExist(err) {
		os.Mkdir("input/videos", 0755)
	}

	// Create the processedVideos output directory if it does not exist
	if _, err := os.Stat("processedVideos"); os.IsNotExist(err) {
		os.Mkdir("processedVideos", 0755)
	}

	// Create the processedImages output directory if it does not exist
	if _, err := os.Stat("processedImages"); os.IsNotExist(err) {
		os.Mkdir("processedImages", 0755)
	}

	//Init All Route
	route.InitVideoRoutes(router)
	route.InitSessionRoutes(router)

	return router
}
