package main

import (
	"ProblemTracker/database"
	"ProblemTracker/routes"
	"log"
	"net/http"
	"os"
	"github.com/joho/godotenv"
	"ProblemTracker/middleware"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error Loading the .env File")
	}
	database.ConnectDatabase()
	mux := routes.SetupRoutes()
	port := os.Getenv("PORT")
	log.Println("Server started Running")
	err = http.ListenAndServe(":" + port , middleware.CORSMiddleware(mux))
	if err != nil {
		log.Fatal(err)
	}
}