package repository

import (
	"ProblemTracker/database"
	"ProblemTracker/models"
	"errors"
	"gorm.io/gorm"
)

func CreateUser(user *models.User) error {
	return database.DB.Create(user).Error
}

func IsUserExist(UserName string) (bool , error) {
	var user models.User
	err := database.DB.Where("user_name = ?" , UserName).First(&user).Error
	if err != nil {
		if errors.Is(err , gorm.ErrRecordNotFound) {
			return false , nil
		}
		return false , err
	}
	return true , nil
}

func GetUserByUserName(UserName string) (*models.User , error) {
	var user models.User
	err := database.DB.Where("user_name = ?" , UserName).First(&user).Error
	if err != nil {
		return nil , err
	}
	return &user , nil
}

func PostProblem(problem *models.Problem) (bool , error) {
	result := database.DB.Create(problem)
	if result.Error != nil {
		return false , result.Error
	}
	return result.RowsAffected > 0 , nil
}

func GetProblemByName(problemName string , UserID int) (*models.Problem , error) {
	var problem models.Problem
	err := database.DB.
		Where("problem_name = ? AND user_id = ?" , problemName , UserID).
		First(&problem).Error
	if err != nil {
		return nil , err
	}
	println("SEARCHING:", problemName, UserID)
	return &problem , nil
}

func GetProblemByURL(url string , UserID int) (*models.Problem , error) {
	var problem models.Problem
	err := database.DB.
		Where("url = ? AND user_id = ?" , url , UserID).
		First(&problem).Error
	if err != nil {
		return nil , err
	}
	return &problem , nil
}

func GetAllProblems(UserID int) ([]models.Problem , error) {
	var problems []models.Problem
	err := database.DB.
		Where("user_id = ?" , UserID).
		Find(&problems).Error
	if err != nil {
		return nil , err
	}
	return problems , nil
}

func DeleteProblem(urls []string , UserID int) (bool , error) {
	if len(urls) == 0 {
		return false , nil
	}
	tx := database.DB.Begin()
	var problemIDs []int
	err := tx.Model(&models.Problem{}).
		Where("url IN ? AND user_id = ?" , urls , UserID).
		Pluck("problem_id" , &problemIDs).Error
	if err != nil {
		tx.Rollback()
		return false , err
	}
	if len(problemIDs) == 0 {
		tx.Rollback()
		return false , nil
	}
	result := tx.Where("problem_id IN ?" , problemIDs).
		Delete(&models.Problem{})
	if result.Error != nil {
		tx.Rollback()
		return false , result.Error
	}
	err = tx.Commit().Error
	if err != nil {
		return false , err
	}
	return result.RowsAffected > 0 , nil
}