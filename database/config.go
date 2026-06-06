package database
import (
	"os"
	"log"
	"ProblemTracker/models"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)
var DB *gorm.DB

func ConnectDatabase() {
	DataBaseName := os.Getenv("DB_NAME")
	var err error
	DB , err = gorm.Open(sqlite.Open(DataBaseName) , &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to Connect to Database:" , err)
	}
	err = DB.AutoMigrate(
		&models.User{},
		&models.Problem{},
	)
	if err != nil {
		log.Fatal("AutoMigrate has Failed :" , err)
	}
	log.Println("Connected to Database successfully")
}