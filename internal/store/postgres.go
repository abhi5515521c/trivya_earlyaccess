package store

import (
	"context"
	"fmt"
	"os"
	"sync"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Store struct {
	Pool *pgxpool.Pool
}

var (
	instance *Store
	once     sync.Once
)

// InitPostgres initializes the pgxpool connection pool
func InitPostgres(ctx context.Context) (*Store, error) {
	var initErr error
	once.Do(func() {
		host := os.Getenv("POSTGRES_HOST")
		port := os.Getenv("POSTGRES_PORT")
		user := os.Getenv("POSTGRES_USER")
		password := os.Getenv("POSTGRES_PASSWORD")
		dbName := os.Getenv("POSTGRES_DB")

		dsn := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", user, password, host, port, dbName)

		config, err := pgxpool.ParseConfig(dsn)
		if err != nil {
			initErr = fmt.Errorf("unable to parse connection string: %w", err)
			return
		}

		// Configure pool settings
		config.MaxConns = 25
		config.MinConns = 2
		config.MaxConnIdleTime = 30 * time.Minute

		pool, err := pgxpool.NewWithConfig(ctx, config)
		if err != nil {
			initErr = fmt.Errorf("unable to create connection pool: %w", err)
			return
		}

		// Verify connection
		if err := pool.Ping(ctx); err != nil {
			pool.Close()
			initErr = fmt.Errorf("unable to ping database on startup: %w", err)
			return
		}

		instance = &Store{Pool: pool}
	})

	if initErr != nil {
		return nil, initErr
	}
	return instance, nil
}

// Close gracefully closes the pgxpool pool
func (s *Store) Close() {
	if s.Pool != nil {
		s.Pool.Close()
	}
}

