package handlers

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"regexp"
	"strings"
	"time"

	"trivya/internal/store"

	"github.com/jackc/pgx/v5/pgconn"
)

type EarlyAccessRequest struct {
	Name     string `json:"name"`
	Persona  string `json:"persona"`
	Email    string `json:"email"`
	Feedback string `json:"feedback"`
}

type EarlyAccessResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)

func RegisterEarlyAccessHandler(s *store.Store) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		if r.Method != http.MethodPost {
			writeJSONResponse(w, http.StatusMethodNotAllowed, false, "Method not allowed")
			return
		}

		var req EarlyAccessRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeJSONResponse(w, http.StatusBadRequest, false, "Invalid JSON payload")
			return
		}

		// Validation & Normalization
		name := strings.TrimSpace(req.Name)
		persona := strings.TrimSpace(req.Persona)
		email := strings.ToLower(strings.TrimSpace(req.Email))
		feedback := strings.TrimSpace(req.Feedback)

		if name == "" {
			writeJSONResponse(w, http.StatusBadRequest, false, "Name cannot be blank")
			return
		}
		if persona == "" {
			writeJSONResponse(w, http.StatusBadRequest, false, "Persona cannot be blank")
			return
		}
		if email == "" || !emailRegex.MatchString(email) {
			writeJSONResponse(w, http.StatusBadRequest, false, "A valid email is required")
			return
		}

		// Insert into PostgreSQL
		var insertedID string
		query := `
			INSERT INTO early_access (name, persona, email, transparency_feedback, early_access_granted)
			VALUES ($1, $2, $3, $4, TRUE)
			RETURNING id;
		`
		
		err := s.Pool.QueryRow(r.Context(), query, name, persona, email, feedback).Scan(&insertedID)
		if err != nil {
			var pgErr *pgconn.PgError
			if errors.As(err, &pgErr) && pgErr.Code == "23505" {
				// Send Brevo Email even if already registered
				emailErr := sendEarlyAccessConfirmationEmail(name, email)
				if emailErr != nil {
					fmt.Printf("[ERROR] Failed to re-send Brevo confirmation email to %s: %v\n", email, emailErr)
				} else {
					fmt.Printf("[INFO] Confirmation email successfully re-sent to already registered user %s\n", email)
				}
				writeJSONResponse(w, http.StatusConflict, false, "Email already registered")
				return
			}
			fmt.Printf("Database error: %v\n", err)
			writeJSONResponse(w, http.StatusInternalServerError, false, "Internal server error")
			return
		}

		// Send Brevo Email
		emailErr := sendEarlyAccessConfirmationEmail(name, email)
		if emailErr != nil {
			fmt.Printf("[ERROR] Failed to send Brevo confirmation email to %s: %v\n", email, emailErr)
			// Do NOT fail form submission
		} else {
			// Optional: Update DB to mark email as sent if you still have that column
			_, updateErr := s.Pool.Exec(r.Context(), "UPDATE early_access SET sent_email = TRUE, sent_at = NOW() WHERE id = $1", insertedID)
			if updateErr != nil {
				fmt.Printf("[WARNING] Could not update sent_email status for %s: %v\n", email, updateErr)
			}
			fmt.Printf("[INFO] Confirmation email successfully sent to %s\n", email)
		}

		writeJSONResponse(w, http.StatusCreated, true, "Confirmation email sent")
	}
}

func writeJSONResponse(w http.ResponseWriter, statusCode int, success bool, message string) {
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(EarlyAccessResponse{
		Success: success,
		Message: message,
	})
}

type BrevoRecipient struct {
	Email string `json:"email"`
	Name  string `json:"name"`
}

type BrevoSender struct {
	Email string `json:"email"`
	Name  string `json:"name"`
}

type BrevoPayload struct {
	Sender      BrevoSender            `json:"sender"`
	To          []BrevoRecipient       `json:"to"`
	Subject     string                 `json:"subject"`
	HtmlContent string                 `json:"htmlContent"`
}

func sendEarlyAccessConfirmationEmail(name, email string) error {
	apiKey := os.Getenv("BREVO_API_KEY")
	if apiKey == "" {
		return errors.New("BREVO_API_KEY is not set")
	}

	url := "https://api.brevo.com/v3/smtp/email"

	htmlBody := fmt.Sprintf(`<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Segoe UI', sans-serif; background-color: #020204; color: #FFF; padding: 40px 20px; margin: 0;">
    <div style="max-width: 480px; margin: 0 auto; background: linear-gradient(135deg, #0c0c0f 0%%, #1a1a2e 100%%); padding: 40px; border-radius: 20px; border: 1px solid rgba(168, 85, 247, 0.15); box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);">
        <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-size: 48px;">🎉</span>
        </div>
        <h2 style="color: #a855f7; margin-top: 0; font-size: 22px; font-weight: 700; text-align: center;">Congratulations, %s!</h2>
        <p style="color: #d4d4d8; font-size: 15px; line-height: 1.7; text-align: center;">You have been selected for <strong style="color: #a855f7;">Early Access</strong> to <strong style="color: #ffffff;">TRIVYA</strong>.</p>
        <div style="background: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.2); border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center;">
            <p style="color: #a1a1aa; font-size: 13px; margin: 0 0 4px 0;">Your registered email</p>
            <p style="color: #ffffff; font-size: 15px; font-weight: 600; margin: 0;">%s</p>
        </div>
        <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6; text-align: center;">We are rolling out access in waves. Keep an eye on your inbox for your exclusive access link.</p>
        <hr style="border: 0; border-top: 1px solid rgba(255, 255, 255, 0.06); margin: 28px 0;">
        <p style="font-size: 11px; color: #52525b; text-align: center; margin: 0;">Data speaks. Trivya stays neutral.</p>
    </div>
</body>
</html>`, name, email)

	payload := BrevoPayload{
		Sender: BrevoSender{
			Name:  "Trivya",
			Email: "saiabhijeet55155@gmail.com",
		},
		To: []BrevoRecipient{
			{
				Email: email,
				Name:  name,
			},
		},
		Subject:     "You're on the TRIVYA early access list",
		HtmlContent: htmlBody,
	}

	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal JSON payload: %w", err)
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonPayload))
	if err != nil {
		return fmt.Errorf("failed to create http request: %w", err)
	}

	req.Header.Set("accept", "application/json")
	req.Header.Set("api-key", apiKey)
	req.Header.Set("content-type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("network error hitting Brevo HTTP API: %w", err)
	}
	defer resp.Body.Close()

	bodyBytes, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusAccepted {
		return fmt.Errorf("brevo HTTP API returned status %d: %s", resp.StatusCode, string(bodyBytes))
	}

	return nil
}
