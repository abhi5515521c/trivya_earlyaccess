package models

import "time"

type EarlyAccess struct {
	ID                   string    `json:"id"`
	Name                 string    `json:"name"`
	Persona              string    `json:"persona"`
	Email                string    `json:"email"`
	TransparencyFeedback string    `json:"feedback"`
	CreatedAt            time.Time `json:"created_at"`
}
