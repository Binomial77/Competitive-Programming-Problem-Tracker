package models

import "github.com/golang-jwt/jwt/v5"

type User struct {
	UserID   int    `gorm:"primaryKey" json:"user_id"`
	UserName string `gorm:"not null;unique" json:"username"`
	Password string `gorm:"not null" json:"password"`
}

type Problem struct {
	ProblemID int       `gorm:"primaryKey;autoIncrement" json:"problem_id"`
	URL string          `gorm:"not null;uniqueIndex:user_problem" json:"problem_url"`
	ProblemName string  `gorm:"not null" json:"problem_name"`
	UserID int          `gorm:"uniqueIndex:user_problem" json:"user_id"`
	Approach string     `json:"approach"`
	DifficultyRating int      `gorm:"not null" json:"difficultyrating"`
}

type SignupRequest struct {
	UserName string `json:"username"`
	Password string `json:"password"`
}

type Claims struct {
	UserID  int `json:"user_id"`
	jwt.RegisteredClaims
}

type LoginRequest struct {
	UserName string `json:"username"`
	Password string `json:"password"`
}
